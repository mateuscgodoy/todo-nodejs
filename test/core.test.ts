import assert from "node:assert";
import { todoValidation } from "../src/core/index.js";
import { describe, test } from "node:test";

const { validateToDoText } = todoValidation;

describe("Input Validation Functions", () => {
  describe("To-Do text func", () => {
    test("Returns true with a valid input", () => {
      assert.strictEqual(validateToDoText("A valid to-do!"), true);
    });
    test("Returns an error message when an empty string is provided", () => {
      assert.strictEqual(
        validateToDoText(""),
        "Error: a To-Do must have some text information."
      );
    });
  });
});
