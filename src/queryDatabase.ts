import { DatabaseSync, StatementSync } from 'node:sqlite';

type InputTodo = {
  title: string;
  assignedTo: string;
};

type Todo = {
  id: number;
  title: string;
  assignedTo: string;
  done: boolean;
};

type TodoDBM = {
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

  insertTodo(todo: InputTodo, statement?: StatementSync): void {
    if (statement) {
      statement.run(todo.title, todo.assignedTo);
      return;
    }

    const insertStatement = this.instance.prepare(
      'INSERT INTO todos (title, assignedTo, done) VALUES (?, ?, 0);'
    );
    insertStatement.run(todo.title, todo.assignedTo);
  }

  insertTodos(todos: InputTodo[]) {
    const statement = this.instance
      .prepare(`INSERT INTO todos (title, assignedTo, done) VALUES
            (?, ?, 0);`);
    for (const todo of todos) {
      statement.run(todo.title, todo.assignedTo);
    }
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

  getTodoById() {}
}
