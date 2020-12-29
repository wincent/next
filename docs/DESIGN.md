# Motivation

- I'm a [Things] user on macOS and iOS; they offer no Linux or web client, so I want to move to something in an entirely open format in order to escape vendor lock-in.

# Desiderata

- Main interface should be the command-line, but this doesn't preclude the creation of other layers (for example, a Vim plug-in).
- Sync should be via Git repo (ie. no need to build against some kind of Cloud API; can use private repo for privacy, or not; no need for CRDTs or complex merge resolution; note that this means I can at least read TODOs on my phone, and potentially even add/modify them, if the data format is simple enough).
- Layer on top of Git to handle common operations (syncing, resolving conflicts etc).
- Split data into files to reduce likelihood of merge conflicts.
- Ability to use as a task tracker in any Git project, or as an independent repo for all of ones TODOs (ie. can use it to dogfood in this project itself; aim to self-host early on).
- `.nextrc` file to define where files should be stored (ie. branch, folder; if a branch, default expectation may be that it be directly accessible using `git-worktree`).
- Note: while a JSON config file would be easy to parse, I think I want it to be easy to read/write, so I'll use an [INI]-like format (could be [TOML]-like or literal INI).
- Ability to have a quick-entry shortcut (eg. callable from dmenu or Alfred etc, that would dump a new task into the global task store as defined in `~/.config/next/nextrc`).
- Small dependency footprint (eg. NodeJS + TypeScript; maybe Yarn as well).
- Recurring items (eg. template + instances).
- Reminders (potentially via a cron job and firing a notification); note: these will only work when I'm at a computer but that may be ok.
- Natural language scheduling abilities.
  - `today`, `tomorrow`, `next week` (ie. same day next week).
  - Flexible date syntax (eg. `2 days`, `2days`, `2.days`, `2d` would all mean the same).
- Priority levels.
- Markdown syntax in task text (both title and notes).
- No JSON in user-editable task data (resolving merge conflicts in JSON is relatively painful; also, want everything to be readable on a phone).
- Migrate completed and deleted tasks into separate files to keep working set of pending tasks small and fast.
- Use some ephemeral data (not committed to repo) to enhance operation; this can be safely deleted (example: recency information used to rank items when selecting from lists; this one can be stored in a JSON file).

# Example

Based on my usage of Things 3, these are the conceptual entities that would prove useful:

- Areas (eg. "Work", "Personal", "Home", "Projects", "Media", "Shopping", "Archive" etc)
- Projects (eg. "Next", "Backlog" etc).
- Synthetic views (eg. "Inbox", "Today", "Upcoming", "Anytime", "Someday", "Logbook", "Trash" etc)
- Tasks with notes and subtasks (called "checklists" in Things).
- Tags (eg. "vim", "screencast", "easy", "itch", "wishlist" etc).

# Nice-to-haves

- Encryption (ie. privacy beyond what you would get with GitHub private repos alone).
- Ability to schedule events for "Today" or "This evening".
- Projects can contain headers that divide tasks into groups.
- [ncurses]-based interface
- Web interface

# Probably not interesting

- Ability to convert tasks into projects.
- Ability to copy projects, set deadlines, make projects recur etc.

# Likely format

- Areas = directories.
- Projects = files.
- Tasks = lines in those files.
- Tags = `#tag`
- Metadata = `key:value`
- Priority = `!`, `!!`, `!!!` etc (or could do a Todoist style `p1`, `p2`, `p3` etc).

Note that the above are used _inside_ the task files. You should be able to specify the project and/or area for a new task with `@this` syntax when performing operations on the command-line:

```
next add Buy milk @shopping/groceries
```

Note there that I think I want area/project matches to be case-insensitive, and also to allow for fuzzy matches; in the event that there is ambiguity, we should prompt the user to choose:

```
next add Call bob @next # prompts for whether you mean Work/Next or Personal/Next or Projects/Next
next add Buy Ryzen CPU @shopping # asks you which project you want from that area
next add Smash like button @e # offers menu with fuzzy matches (eg. @Work/Next, @Work/Icebox, @Projects/Next etc) or ability to create new.
next add Sell house @ # offers Skim-like fuzzy find menu
next add Buy house # no @, so this one goes straight into Inbox
```

Likely metadata tags include `due:time`, `remind:time`, `when:time`, `repeat:spec` etc. Note that `time` could be natural language (eg. `tomorrow`) or shorthand `+1h`.

(Note: `due` means "must finish by this time", `remind` obviously means "show me a reminder at this time", `when` means "show this as ready to start at this time", and `repeat` basically specifies a template for how additional instances of a task should be instantiated.)

In terms of handling multi-word keys, that will either be:

- `repeat:(every Friday starting next month)`; or:
- `repeat:"every weekday for 3 weeks"`.

Sadly, I think I like the look of the parens better, but I don't think I can use it because the shell will freak out about it. Note that if you pass `repeat:"every day"` process will see `repeat:every day` as a single param; it doesn't actually get the quotes themselves.

Speaking of repeating tasks, may also want an `until:time` field and a `from:time` &mdash; maybe also a `for:duration` &mdash; so that you have the option of breaking up a long spec into multiple things (and under the covers, we would decompose like that anyway and store in the metadata); eg. these (and many others) would all be equivalent:

- `repeat:"every monday and wednesday during november"`
- `repeat:"every monday and wednesday" from:nov until:dec`
- `repeat:"mon,wed" from:2020-11-01 for:1m` (note here that `m` is shorthand for month; we won't need to schedule at the granularity of minutes most of the time, so the ambiguous abbrevation gets resolved in favor of the common case)

Options for indicating task status:

```
- [ ] GitHub style checkboxes.
x todo.txt style leading "x".
o could use an explicit "o" for "not completed"
  or just a blank like at the start of this line
```

The main drawback of the GitHub style is that it is more awkward to type, in the absence of some Vim-plugin-powered shortcuts.

Here is what they would look like with nesting, notes, and some metadata:

```
- [ ] Run to bank when:

  Note that it shuts at lunch-time though. *Damn.*

  - [ ] Get bus ticket
  - [ ] Grab spare socks
  - [ ] Actually go to bank

x Buy eggs

  Make sure they are free range.

  x Go to supermarket
  o Find eggs
  o Pay for eggs

o Pack suitcase
```

Note there is some ambiguity that needs to be defined away when it comes to what "x" and "o" mean when applied to a task with subtasks; it may be necessary to add "-" as a marked and use that to indicate mixed state, or we might just force "o" if any subtask is "o".

The other consideration here is what to do with other metadata once a task is added. For example, should we add an `id:identifier` metadata pair? Should IDs be human-readable (monotonically increasing integers may lead to merge conflicts) or randomish (UUIDs)? What should instances of recurring task templates look like? (ie. should that have an `instance-of:id` metadata there?) Do we want to add additional metadata like `created:time`? Do we want to preserve original natural language specifiers like `something:"next wednesday"` while simultaneously storing a resolved version of the same, like `something-resolved:2021-01-06`?

What do we want to do for tasks that are in an area but not assigned to a specific project? If areas correspond to folders, maybe by convention we need an "index" or "catch-all" file that holds such tasks. That would also be a good place for Area-specific metadata (like description, or due date, if I ever decide to add such a thing).

# Commands

- `next`: show default "next" view
- `next help`: show help (Markdown; might want to render this in color for the terminal)
  - `next commands`: show all commands (summary)
  - `next help COMMAND`: show help for specific command (`--help` should also do that)
- `next add SPEC`: adds a task
  - `next add -v [SPEC]`: adds a task in visual mode, which uses `$EDITOR` (see the `next edit` command).
- `next done ID`: mark a task as done (note: all these commands that take IDs will do a fuzzy fallback search if no match; weight list by recency of interaction, and if no ID supplied at all, use recency data to show last-touched task and ask user for confirmation)
- `next edit ID`: open buffer in `$EDITOR` with all metadata exploded out onto rows; changes made in the buffer get saved back to disk.
- `next move ID @AREA/PROJECT`: moves a project
- `next config`: read and write config values
- `next ls|list PATTERN`: search/list tasks
- `next repl`: interactive command-line mode
- `next show ANYTHING`: show info for whatever is identified by `ANYTHING` (may be able to force item type with `task:ID` or `project:foo` or `@foo` etc)
- `next sync`: Git push and pull to bring local copy into sync.
- `next when ID [SCHEDULE]`: shows or modifies task scheduling information.
- `next ANYTHING`: anything not recognized by the above is a search

# Options

- `next -c config`: provide explicit path to config; otherwise we just walk up to nearest `.nextrc` (or `~/.config/next/nextrc`)
- `next -g/--global`: force operation on global task list (ie. in a project with a local `.nextrc`, this ignores it and forces the tool to look for `~/.config/next/nextrc`)

# Why not use one of the 1.21 zillion existing command-line TODO apps out there?

- Building things is fun.
- I haven't seen one yet that uses Git for merging syncing.

# Prior art

- [Taskwarrior]: JSON-based command-line task management.
- [todo.txt]: Bash-powered command-line tool with simple plain-text file format.

[ini]: https://en.wikipedia.org/wiki/INI_file
[toml]: https://github.com/toml-lang/toml
[ncurses]: https://invisible-island.net/ncurses/
[taskwarrior]: https://taskwarrior.org/docs/30second.html
[things]: https://culturedcode.com/things
[todoist]: https://todoist.com/
[todo.txt]: https://github.com/todotxt/todo.txt
