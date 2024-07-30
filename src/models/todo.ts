export type TodoDTO = {
  id: number;
  task: string;
  completed: boolean;
};

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

  public toString(): string {
    return `ID: ${this.id} - ${this._task} - ${
      this.completed ? "[✅ COMPLETED]" : "❌"
    }`;
  }

  public serialize(): TodoDTO {
    return {
      id: this._id,
      task: this._task,
      completed: this._completed,
    };
  }

  public static parse(todoDTO: TodoDTO): Todo {
    return new Todo(todoDTO.task, todoDTO.id, todoDTO.completed);
  }
}
