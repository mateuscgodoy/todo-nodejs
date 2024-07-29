import { findTodoById } from "../data/index.js";

export class Todo {
  private _task: string;
  private _id: number;
  private _completed: boolean = false;

  constructor(text: string, id?: number, completed?: boolean) {
    this._task = text;
    this._id = id ?? Date.now();
    this._completed = completed ?? false;
  }

  get id(): number {
    return this._id;
  }

  get task(): string {
    return this._task;
  }

  get completed(): boolean {
    return this._completed;
  }

  set completed(value: boolean) {
    this._completed = value;
  }

  public display(): string {
    return `ID: ${this.id} - ${this._task} - ${
      this.completed ? "[✅ COMPLETED]" : "❌"
    }`;
  }

  public serialize(): { id: number; task: string; completed: boolean } {
    return {
      id: this._id,
      task: this._task,
      completed: this._completed,
    };
  }

  public static parse(json: {
    id: number;
    task: string;
    completed: boolean;
  }): Todo {
    return new Todo(json.task, json.id, json.completed);
  }
}

const validateToDoText = (text: string): boolean | string => {
  if (!text || text.length === 0)
    return "Error: a To-Do must have some text information.";
  return true;
};

const validateToDoId = async (
  id: string,
  cb?: () => {}
): Promise<boolean | string> => {
  const numID = Number(id);
  if (isNaN(numID)) return "Error: the ID value must be a number.";
  const todo = await findTodoById(numID);
  if (!todo) return "Error: the provided ID is invalid.";
  return true;
};

export const todoValidation = { validateToDoId, validateToDoText };
