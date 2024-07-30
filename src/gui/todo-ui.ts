import { input } from "@inquirer/prompts";
import { todoValidation } from "../core/index.js";
import todoEmitter from "../lib/eventEmitter.js";
import { Todo } from "../models/todo.js";

const addTodo = async () => {
  const task = await input({
    message: "Enter your To-Do task:",
    validate: todoValidation.validateToDoText,
  });
  todoEmitter.emit("todoAdded", new Todo(task));
};

const completeTodo = async () => {
  const id = await getIdAsync("Enter the To-Do ID you would like to complete:");
  todoEmitter.emit("todoCompleted", Number(id));
};

const removeTodo = async () => {
  const id = await getIdAsync("Enter the To-Do ID you would like to remove:");
  todoEmitter.emit("todoRemoved", Number(id));
};

export const getIdAsync = async (message?: string) => {
  return await input({
    message: message || "Enter todo:",
    validate: async (value: string): Promise<string | boolean> => {
      return new Promise((resolve, reject) => {
        todoEmitter.emit(
          "validateTodo",
          value,
          (error: string | null, isValid: boolean) => {
            if (error || !isValid) {
              resolve(
                error || "Error: Unexpected error occurred. Please try again."
              );
            } else {
              resolve(true);
            }
          }
        );
      });
    },
  });
};

const printTodos = (todos: Todo[]) => {
  for (const todo of todos) {
    console.log(todo.display());
  }
};

export const uiTodo = {
  addTodo,
  completeTodo,
  removeTodo,
  printTodos,
};
