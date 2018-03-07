open Jest;

open Expect;

open Uuid;

describe("getUUID()", () => {
  test("UUIDs are unique", () => {
    let a = getUUID();
    let b = getUUID();
    expect(a) |> not_ |> toBe(b);
  });
  test("UUIDs look like UUIDs", () => {
    Random.init(0);
    expect(getUUID()) |> toBe("0cff09b0-365a-47d2-be15-1d5a3dc277f4");
  });
});
