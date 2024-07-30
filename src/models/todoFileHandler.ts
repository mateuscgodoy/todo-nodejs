import fs from "node:fs/promises";
import { Todo } from "./todo.js";

export class TodoFileHandler {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async saveTodos(todos: Todo[]) {
    const serializedTodos = todos.map((td) => td.serialize());
    await fs.writeFile(this.filePath, JSON.stringify(serializedTodos, null, 2));
  }

  async readTodos(): Promise<Todo[]> {
    let data;
    try {
      data = await fs.readFile(this.filePath, "utf8");
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
  }
}
