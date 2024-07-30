import path from "node:path";
import todoEmitter from "../lib/eventEmitter.js";
import { Todo } from "./todo.js";
import TodoFileHandler from "./todoFileHandler.js";

let fileHandler: TodoFileHandler;

/**
 * This is the callback that will be passed to validateNewTodo
 * I added it here just for internal design and it should be remove as soon as the 
 * implementation of the validator function is finished.
 * 
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
    const filePath = path.join(import.meta.dirname, "todos.txt");
    fileHandler = await TodoFileHandler.create(filePath);
  } catch (error) {
    throw error;
  }
});

todoEmitter.on("todoAdded", async (todo: Todo) => {
  const todos = await fileHandler.readTodos();
  todos.push(todo);
  await fileHandler.saveTodos(todos);
  todoEmitter.emit("operationSucceed", "🆕 To-Do added with success!");
});

todoEmitter.on("todoCompleted", async (id: number) => {
  const todos = await fileHandler.readTodos();
  const index = todos.findIndex((td: Todo) => td.id === id);
  if (index === -1)
    throw new Error("Error: To-Do not found operation aborted.");
  todos[index].completed = true;
  await fileHandler.saveTodos(todos);
  todoEmitter.emit("operationSucceed", "✅ To-Do completed with success!");
});

todoEmitter.on("todoRemoved", async (id: number) => {
  let todos = await fileHandler.readTodos();
  todos = todos.filter((td) => td.id !== id);
  await fileHandler.saveTodos(todos);
  todoEmitter.emit("operationSucceed", "🗑️ To-Do removed with success!");
});

todoEmitter.on("printTodos", async (cb) => {
  try {
    let todos = await fileHandler.readTodos();
    cb(todos);
    todoEmitter.emit("operationSucceed");
  } catch (error) {
    throw error;
  }
});

todoEmitter.on("validateTodo", validateNewTodo);

export const findTodoById = async (id: number): Promise<Todo | null> => {
  const todos = await fileHandler.readTodos();
  const index = todos.findIndex((td) => td.id === id);
  if (index === -1) return null;
  return todos[index];
};
