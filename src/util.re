/***
 * Join list of `strings` using `separator`.
 */
let rec join = (strings, separator) =>
  switch (strings, separator) {
  | ([], _) => ""
  | ([x], _) => x
  | ([x, ...xs], str) => x ++ str ++ join(xs, str)
  };


/***
 * Convenience utility for creating a list covering a range.
 *
 *   # range 1 4;
 *   [1, 2, 3, 4]
 */
let rec range = (a, b) => a > b ? [] : [a, ...range(a + 1, b)];
