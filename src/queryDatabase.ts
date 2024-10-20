import {
  DatabaseSync,
  StatementResultingChanges,
  StatementSync,
} from 'node:sqlite';

export type InputTodo = {
  title: string;
  assignedTo: string;
};

export type Todo = {
  id: number;
  title: string;
  assignedTo: string;
  done: boolean;
};

export type TodoDBM = {
  id: number;
  title: string;
  assignedTo: string;
  done: number;
};

export default class QueryDatabase {
  private instance;

  constructor(dbPath: string) {
    this.instance = new DatabaseSync(dbPath);
    this.instance.exec(`CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          assignedTo TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0
        )`);
  }

  insertTodo(
    todo: InputTodo,
    statement?: StatementSync
  ): StatementResultingChanges {
    if (!todo || !todo.title || !todo.assignedTo) {
      throw new DatabaseError<InputTodo>(
        'Error: the Todo provided is invalid',
        todo
      );
    }

    if (statement) {
      return statement.run(todo.title, todo.assignedTo);
    }

    const insertStatement = this.instance.prepare(
      'INSERT INTO todos (title, assignedTo, done) VALUES (?, ?, 0);'
    );
    return insertStatement.run(todo.title, todo.assignedTo);
  }

  insertTodos(todos: InputTodo[]): DatabaseError[] {
    const statement = this.instance
      .prepare(`INSERT INTO todos (title, assignedTo, done) VALUES
            (?, ?, 0);`);

    const results = [];
    for (const todo of todos) {
      try {
        this.insertTodo(todo, statement);
      } catch (error) {
        if (error instanceof DatabaseError) {
          results.push(error);
        }
      }
    }
    return results;
  }

  getAllTodos() {
    const getStatement = this.instance.prepare(`SELECT * FROM todos;`);
    const dBMTodos = getStatement.all() as TodoDBM[];
    const todos = dBMTodos.map((todo) => {
      return {
        ...todo,
        done: !!todo.done,
      };
    }) as Todo[];
    return todos;
  }

  getTodoById(id: number): Todo | DatabaseError {
    const getStatement = this.instance.prepare(
      `SELECT * FROM todos WHERE id=?`
    );
    const todoDBM = getStatement.get(id) as TodoDBM | undefined;
    if (!todoDBM || !todoDBM.id) {
      throw new DatabaseError<number>(
        'Error: there is no Todo that matches the provided ID',
        id
      );
    }
    const todo: Todo = { ...todoDBM, done: !!todoDBM };
    return todo;
  }
}

export class DatabaseError<T = unknown> extends Error {
  private _input: T;

  constructor(message: string, input?: T) {
    super(message);
    this._input = input as T;
  }

  public get input(): T {
    return this._input;
  }
}
