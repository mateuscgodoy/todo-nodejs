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
      throw new DatabaseError(
        `Error: Todo with Title=${todo.title}, Assigned To=${todo.assignedTo} is invalid`
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

  insertTodos(
    todos: InputTodo[]
  ): (DatabaseError | StatementResultingChanges)[] {
    const statement = this.instance
      .prepare(`INSERT INTO todos (title, assignedTo, done) VALUES
            (?, ?, 0);`);

    const results = [];
    let result: StatementResultingChanges | DatabaseError | null = null;
    for (const todo of todos) {
      try {
        result = this.insertTodo(todo, statement);
      } catch (error) {
        if (error instanceof DatabaseError) {
          result = error;
        }
      } finally {
        if (result) {
          results.push(result);
          result = null;
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
    if (!todoDBM) {
      throw new DatabaseError(
        'Error: there is no Todo that matches the provided ID'
      );
    }
    const todo: Todo = { ...todoDBM, done: !!todoDBM };
    return todo;
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}
