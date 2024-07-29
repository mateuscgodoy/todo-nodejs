import fs from "fs/promises";
import path from "path";
import todoEmitter from "../lib/eventEmitter.js";
import { Todo } from "../core/index.js";

const filePath = path.join(import.meta.dirname, "todos.txt");

const saveTodosToFile = async (todos: Todo[]) => {
  const serializedTodos = todos.map((td) => td.serialize());
  await fs.writeFile(filePath, JSON.stringify(serializedTodos, null, 2));
};

const readTodosFromFile = async (): Promise<Todo[]> => {
  let data;
  try {
    data = await fs.readFile(filePath, "utf8");
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("File does not exist yet.");
    } else {
      throw error;
    }
  } finally {
    if (!data) return [];

    const todos: Todo[] = JSON.parse(data);
    return todos.map((td) => Todo.parse(td));
  }
};

/**
 (error: string | null, isValid: boolean) => {
    if (error || !isValid) {
      resolve(
        error || "Error: Unexpected error occurred. Please try again."
      );
    } else {
      resolve(true);
    }
  }
 */

export const validateNewTodo = async (
  id: string,
  cb: (error: string | null, isValid: boolean) => void
) => {
  const numID = Number(id);
  if (isNaN(numID)) {
    cb("Error: the ID value must be a number.", false);
    return;
  }

  const todo = await findTodoById(numID);
  if (!todo) {
    cb("Error: the provided ID is invalid.", false);
    return;
  }

  cb(null, true);
};

todoEmitter.on("start", async () => {
  try {
    const fileHandler = await fs.open(filePath);
    await fileHandler.close();
  } catch (error: any) {
    if (error.code === "ENOENT") await fs.writeFile(filePath, "");
    else throw error;
  }
});

todoEmitter.on("todoAdded", async (todo: Todo) => {
  const todos = await readTodosFromFile();
  todos.push(todo);
  await saveTodosToFile(todos);
  todoEmitter.emit("operationSucceed", "🆕 To-Do added with success!");
});

todoEmitter.on("todoCompleted", async (id: number) => {
  const todos = await readTodosFromFile();
  const index = todos.findIndex((td) => td.id === id);
  if (index === -1)
    throw new Error("Error: To-Do not found operation aborted.");
  todos[index].completed = true;
  await saveTodosToFile(todos);
  todoEmitter.emit("operationSucceed", "✅ To-Do completed with success!");
});

todoEmitter.on("todoRemoved", async (id: number) => {
  let todos = await readTodosFromFile();
  todos = todos.filter((td) => td.id !== id);
  await saveTodosToFile(todos);
  todoEmitter.emit("operationSucceed", "🗑️ To-Do removed with success!");
});

todoEmitter.on("printTodos", async (cb) => {
  try {
    let todos = await readTodosFromFile();
    cb(todos);
    todoEmitter.emit("operationSucceed");
  } catch (error) {
    throw error;
  }
});

todoEmitter.on("validateTodo", validateNewTodo);

export const findTodoById = async (id: number): Promise<Todo | null> => {
  const todos = await readTodosFromFile();
  const index = todos.findIndex((td) => td.id === id);
  if (index === -1) return null;
  return todos[index];
};
