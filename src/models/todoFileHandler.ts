import fs from "node:fs/promises";
import { Todo } from "./todo.js";

export default class TodoFileHandler {
  private _filePath: string;

  private constructor(filePath: string) {
    this._filePath = filePath;
  }

  public get filePath(): string {
    return this._filePath;
  }

  private async initialize() {
    try {
      await (await fs.open(this._filePath, "r")).close();
    } catch (error: any) {
      if (error.code === "ENOENT") {
        await fs.writeFile(this._filePath, "");
      } else {
        throw error;
      }
    }
  }

  async saveTodos(todos: Todo[]) {
    const serializedTodos = todos.map((td) => td.serialize());
    await fs.writeFile(
      this._filePath,
      JSON.stringify(serializedTodos, null, 2)
    );
  }

  async readTodos(): Promise<Todo[]> {
    let data;
    try {
      data = await fs.readFile(this._filePath, "utf8");
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

  static async create(filePath: string): Promise<TodoFileHandler> {
    const handler = new TodoFileHandler(filePath);
    await handler.initialize();
    return handler;
  }
}
