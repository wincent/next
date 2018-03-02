open Jest;

open Expect;

open Util;

describe(
  "range()",
  () => {
    test("0..5", () => expect(range(0, 5)) |> toEqual([0, 1, 2, 3, 4, 5]));
    test("10..10", () => expect(range(10, 10)) |> toEqual([10]));
    test("100..1", () => expect(range(100, 1)) |> toEqual([]))
  }
);

describe(
  "join()",
  () => {
    test(
      "with non-empty separator",
      () => expect(join(["this", "that"], ",")) |> toBe("this,that")
    );
    test("with empty separator", () => expect(join(["foo", "bar"], "")) |> toBe("foobar"))
  }
);
