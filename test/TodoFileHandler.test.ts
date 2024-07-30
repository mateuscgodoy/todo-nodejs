import assert from "node:assert";
import fs from "node:fs/promises";
import { describe, mock, test, afterEach } from "node:test";
import TodoFileHandler from "../src/models/todoFileHandler.js";
import { Todo } from "../src/models/todo.js";

const filePath = "./test-todos.txt";

describe("TodoFileHandler test suite", () => {
  afterEach(async () => {
    mock.reset();
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
    }
  });

  test("TodoFileHandler.create initializes correctly", async (context) => {
    const todoFileHandler = await TodoFileHandler.create(filePath);

    assert.strictEqual(todoFileHandler.filePath, filePath);
  });

  test("TodoFileHandler saveTodos and readTodos work with file as intended", async () => {
    const todoFileHandler = await TodoFileHandler.create(filePath);
    const todos = [new Todo("Find a job"), new Todo("Don't get fire from job")];

    await todoFileHandler.saveTodos(todos);
    const savedTodos = await todoFileHandler.readTodos();

    assert.deepEqual(todos, savedTodos);
  });
});
