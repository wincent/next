/* For `join` and `range`. */
open Util;

type t = string;

/* Define some infix operators for readability. */
let (&&&) = Int32.logand;

let (|||) = Int32.logor;

let (<<<) = Int32.shift_left;

let (>>>) = Int32.shift_right_logical;

/* Convenience function. */
let int32 = Int32.of_int;

let digits = [|
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
|];

let to_hex = (a: int32) : string => {
  let nibbles =
    List.map(
      i => digits[Int32.to_int(a >>> i * 4 &&& int32(0xf))],
      range(0, 7) |> List.rev,
    );
  join(nibbles, "");
};

Random.self_init();


/***
 * Return a v4 (random) UUID in string format
 * (https://tools.ietf.org/html/rfc4122).
 *
 * Example:
 *                            node
 *                            |
 *             time-mid  clock-seq-and-reserved
 *             |         |    |
 *             v    *    v    v
 *    f81d4fae-7dec-11d0-a765-00a0c91e6bf6
 *    ^             ^    # ^
 *    |             |      |
 *    time-low      time-high-and-version
 *                         |
 *                         clock-seq-low
 *
 * - Version 4 ("0100") most-significant 4 bits of time-high-and-version (*).
 * - Variant 1 ("10") most-significant 2 bits of clock-seq-and-reserved (#).
 * - Rest random.
 */
let getUUID = () => {
  /* Make a 128-bit timestamp (4 x 32-bit integers). */
  let timestamp = Array.init(4, (_) => Random.int32(Int32.max_int));
  /* Set the version. */
  let masked = timestamp[1] &&& int32(0xffff0fff);
  let version = int32(4) <<< 12;
  timestamp[1] = masked ||| version;
  /* Set the variant. */
  let masked = timestamp[2] &&& int32(0x3fffffff);
  let variant = int32(2) <<< 30;
  timestamp[2] = masked ||| variant;
  /* Turn into a string. */
  let sub = String.sub;
  let uuid = join(List.map(to_hex, Array.to_list(timestamp)), "");
  sub(uuid, 0, 8)
  ++ "-"
  ++ sub(uuid, 8, 4)
  ++ "-"
  ++ sub(uuid, 12, 4)
  ++ "-"
  ++ sub(uuid, 16, 4)
  ++ "-"
  ++ sub(uuid, 20, 12);
};
