open Uuid;

let elementsArray = ReasonReact.array;

let elementsList = l => elementsArray(Array.of_list(l));

let nullElement = ReasonReact.null;

let text = ReasonReact.string;

let style = ReactDOMRe.Style.make;

type uuid = Uuid.t;

/* The `task` type is the core of the data model that we want to place in
 * persistent storage. Other ephemeral data (UI state) lives outside it (eg.
 * whether a particular task is being edited). */
type task = {
  id: uuid,
  title: string,
  completed: bool,
  subtasks: list(task),
};

let escapeKey = 27;

let returnKey = 13;

module TaskInput = {
  type state = {
    newTaskTitle: string,
    inputRef: ref(option(Dom.element)),
  };
  type action =
    | EditNewTaskTitle(string)
    | Reset;
  let component = ReasonReact.reducerComponent("TaskInput");
  let setInputRef = (r, {ReasonReact.state}) =>
    state.inputRef := Js.Nullable.toOption(r);
  let make = (~onCancel=?, ~onCreate, _children) => {
    ...component,
    initialState: () => {newTaskTitle: "", inputRef: ref(None)},
    didMount: self =>
      switch (self.state.inputRef^) {
      | Some(input) =>
        let node = ReactDOMRe.domElementToObj(input);
        node##focus();
      | None => ()
      },
    reducer: (action, state) =>
      switch (action) {
      | EditNewTaskTitle(newTaskTitle) =>
        ReasonReact.Update({...state, newTaskTitle})
      | Reset => ReasonReact.Update({...state, newTaskTitle: ""})
      },
    render: ({handle, state, send}) => {
      let nextTaskTitle = String.trim(state.newTaskTitle);
      let create = title => {
        onCreate(title);
        send(Reset);
      };
      <div
        style=(
          style(
            ~borderTop="1px dotted #eee",
            ~marginTop="8px",
            ~padding="8px",
            (),
          )
        )>
        <input
          type_="text"
          onChange=(
            event =>
              send(EditNewTaskTitle(ReactEvent.Form.target(event)##value))
          )
          onKeyDown=(
            event => {
              let keyCode = ReactEvent.Keyboard.keyCode(event);
              if (nextTaskTitle != "" && keyCode === returnKey) {
                ReactEvent.Keyboard.preventDefault(event);
                create(nextTaskTitle);
              } else if (keyCode === escapeKey) {
                switch (onCancel) {
                | Some(cb) => cb()
                | None => ()
                };
              };
            }
          )
          placeholder="new task"
          ref=(handle(setInputRef))
          value=state.newTaskTitle
        />
        <button
          disabled=(nextTaskTitle == "")
          onClick=(_event => create(state.newTaskTitle))>
          (text("Add Task"))
        </button>
        (
          switch (onCancel) {
          | Some(cb) =>
            <button onClick=(_event => cb())> (text("Cancel")) </button>
          | None => nullElement
          }
        )
      </div>;
    },
  };
};

/* TODO: On clicking on any "add task" button we hide all the others.
 * If any other add task field already has input in it, create the task.
 * Implies that maybe we don't need an actual map, if there can only be one at a
 * time.
 */
/* TODO: add undo button */
module TaskList = {
  module StringSet = Set.Make(String);
  type state = {addingSubtask: StringSet.t};
  type action =
    | AddSubtask(string)
    | CancelAddSubtask;
  let component = ReasonReact.reducerComponent("TaskList");
  let make = (~onUpdate, ~tasks, _children) => {
    let rec renderList =
            (
              self,
              ~tasks,
              ~level,
              ~addingSubtask,
              ~onCancelAddSubtask,
              ~onCreate,
              ~onDelete,
              ~onUpdate,
            ) => {
      let count = List.length(tasks);
      <div style=(style(~paddingLeft=string_of_int(level * 16) ++ "px", ()))>
        (
          if (count == 0) {
            nullElement;
          } else {
            <ul style=(style(~listStyleType="none", ()))>
              (
                elementsList(
                  List.map(
                    task =>
                      renderTask(self, ~task, ~level, ~onDelete, ~onUpdate),
                    tasks,
                  ),
                )
              )
            </ul>;
          }
        )
        (
          if (level == 0) {
            <TaskInput onCreate />;
          } else if (addingSubtask) {
            <TaskInput onCancel=onCancelAddSubtask onCreate />;
          } else {
            nullElement;
          }
        )
      </div>;
    }
    and renderTask = (self, ~task, ~level, ~onDelete, ~onUpdate) => {
      let send = self.ReasonReact.send;
      let state = self.ReasonReact.state;
      let addingSubtask = state.addingSubtask |> StringSet.mem(task.id);
      <li key=task.id>
        <label
          style=(
            style(
              ~textDecoration=task.completed ? "line-through" : "none",
              (),
            )
          )>
          <input
            type_="checkbox"
            checked=task.completed
            onChange=(
              _event => onUpdate({...task, completed: ! task.completed})
            )
          />
          <span title=task.id> (text(" " ++ task.title ++ " ")) </span>
        </label>
        <button
          disabled=(state.addingSubtask |> StringSet.mem(task.id))
          onClick=(_event => send(AddSubtask(task.id)))>
          (text("Add subtask"))
        </button>
        <button onClick=(_event => onDelete(task))>
          (text("delete"))
        </button>
        (
          if (List.length(task.subtasks) != 0 || addingSubtask) {
            renderList(
              self,
              ~tasks=task.subtasks,
              ~level=level + 1,
              ~addingSubtask,
              ~onCancelAddSubtask=() => send(CancelAddSubtask),
              ~onCreate=
                title => {
                  let newTask = {
                    id: getUUID(),
                    title,
                    completed: false,
                    subtasks: [],
                  };
                  onUpdate({...task, subtasks: task.subtasks @ [newTask]});
                },
              ~onDelete=
                t =>
                  onUpdate({
                    ...task,
                    subtasks:
                      List.filter(
                        subtask => subtask.id != t.id,
                        task.subtasks,
                      ),
                  }),
              ~onUpdate=
                t =>
                  onUpdate({
                    ...task,
                    subtasks:
                      List.map(
                        subtask => subtask.id == t.id ? t : subtask,
                        task.subtasks,
                      ),
                  }),
            );
          } else {
            nullElement;
          }
        )
      </li>;
    };
    {
      ...component,
      initialState: () => {addingSubtask: StringSet.empty},
      reducer: (action, _state) =>
        switch (action) {
        | AddSubtask(id) =>
          ReasonReact.Update({
            addingSubtask: StringSet.empty |> StringSet.add(id),
          })
        | CancelAddSubtask =>
          ReasonReact.Update({addingSubtask: StringSet.empty})
        },
      render: self =>
        renderList(
          self,
          ~tasks,
          ~level=0,
          ~addingSubtask=true,
          ~onCancelAddSubtask=() => (),
          ~onCreate=
            title => {
              let task = {
                id: getUUID(),
                title,
                completed: false,
                subtasks: [],
              };
              onUpdate(tasks @ [task]);
            },
          ~onDelete=
            task => onUpdate(List.filter(({id}) => id != task.id, tasks)),
          ~onUpdate=
            task =>
              onUpdate(List.map(t => t.id == task.id ? task : t, tasks)),
        ),
    };
  };
};

module App = {
  type state = {tasks: list(task)};
  type action =
    | Update(list(task));
  let component = ReasonReact.reducerComponent("App");
  let make = _children => {
    ...component,
    initialState: () => {tasks: []},
    reducer: (action, _state) =>
      switch (action) {
      | Update(tasks) => ReasonReact.Update({tasks: tasks})
      },
    render: ({send, state}) =>
      <div style=(style(~fontFamily="courier", ()))>
        <h1> (text("Next")) </h1>
        <TaskList
          onUpdate=(tasks => send(Update(tasks)))
          tasks=state.tasks
        />
      </div>,
  };
};

ReactDOMRe.renderToElementWithId(<App />, "index");
