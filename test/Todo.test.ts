import assert from "node:assert";
import { describe, test } from "node:test";
import { Todo, TodoDTO } from "../src/models/todo.js";

describe("Todo class unit tests", () => {
  test("Todo creates a new instance with only a string task", () => {
    const expected = "Find a job";
    const todo: Todo = new Todo(expected);

    assert.strictEqual(expected, todo.task);
    assert.strictEqual(false, todo.completed);
  });

  test("Todo correctly creates a new instance with all properties informed", () => {
    const time = Date.now();
    const task = "Find a job";
    const completed = true;
    const todo: Todo = new Todo(task, time, completed);

    assert.strictEqual(todo.task, task);
    assert.strictEqual(todo.completed, completed);
    assert.strictEqual(todo.id, time);
  });

  test("Todo toString method prints the Todo state correctly", () => {
    const time = Date.now();
    const task = "Find a job";

    const todo = new Todo(task, time);
    const expected = `ID: ${todo.id} - ${todo.task} - ${
      todo.completed ? "[✅ COMPLETED]" : "❌"
    }`;
    assert.strictEqual(expected, todo.toString());
  });

  test("Todo serialize method generate the correct TodoDTO object", () => {
    const todoDto: TodoDTO = {
      id: Date.now(),
      task: "Find a job",
      completed: false,
    };
    const todo = new Todo(todoDto.task, todoDto.id, todoDto.completed);
    const serialized = todo.serialize();

    assert.deepStrictEqual(todoDto, serialized);
  });

  test("Todo parse static method correctly returns a Todo instance", () => {
    const todoDto: TodoDTO = {
      id: Date.now(),
      task: "Find a job",
      completed: false,
    };

    const todo = Todo.parse(todoDto);
    const isInstance: boolean = todo instanceof Todo;

    assert.strictEqual(todoDto.task, todo.task);
    assert.strictEqual(todoDto.id, todo.id);
    assert.strictEqual(true, isInstance);
  });
});
