// Generated by BUCKLESCRIPT VERSION 2.2.2, PLEASE EDIT WITH CARE
'use strict';

var Jest = require("@glennsl/bs-jest/src/jest.js");
var Random = require("bs-platform/lib/js/random.js");
var Uuid$ReactTemplate = require("../src/uuid.bs.js");

describe("getUUID()", (function () {
        Jest.test("UUIDs are unique", (function () {
                var a = Uuid$ReactTemplate.getUUID(/* () */0);
                var b = Uuid$ReactTemplate.getUUID(/* () */0);
                return Jest.Expect[/* toBe */2](b, Jest.Expect[/* not_ */23](Jest.Expect[/* expect */0](a)));
              }));
        return Jest.test("UUIDs look like UUIDs", (function () {
                      Random.init(0);
                      return Jest.Expect[/* toBe */2]("0cff09b0-365a-47d2-be15-1d5a3dc277f4", Jest.Expect[/* expect */0](Uuid$ReactTemplate.getUUID(/* () */0)));
                    }));
      }));

/*  Not a pure module */