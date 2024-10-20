import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';

import QueryDatabase, { DatabaseError, Todo } from '../queryDatabase.js';

let db: QueryDatabase;

describe('QueryDatabase class', () => {
  beforeEach(() => {
    db = new QueryDatabase(':memory:');
  });

  describe('insertTodo tests', () => {
    it('successfully creates a new todo with valid data', () => {
      const todo = db.insertTodo({ title: 'My new todo', assignedTo: 'Bobby' });
      assert.equal(todo.changes, 1);
    });

    it('throws a DatabaseError if no title is provided', () => {
      const invalidTodo = { title: '', assignedTo: 'Bobby' };
      assert.throws(
        () => {
          db.insertTodo(invalidTodo);
        },
        DatabaseError,
        'Error: the Todo provided is invalid'
      );
    });

    it('throws a DatabaseError if no assignedTo is provided', () => {
      const invalidTodo = { title: 'A valid title', assignedTo: '' };
      assert.throws(
        () => {
          db.insertTodo(invalidTodo);
        },
        DatabaseError,
        'Error: the Todo provided is invalid'
      );
    });
  });

  describe('insertTodos tests', () => {
    it('successfully creates three valid todos at once', () => {
      const todos = [
        { title: 'My valid todo 1', assignedTo: 'Bobby' },
        { title: 'My valid todo 2', assignedTo: 'Susan' },
        { title: 'My valid todo 3', assignedTo: 'Merry' },
      ];
      const results = db.insertTodos(todos);

      assert.equal(
        results.some((result) => result instanceof DatabaseError),
        false
      );
    });

    it('add valid todos and reject the invalid ones', () => {
      const todos = [
        { title: 'My valid todo 1', assignedTo: 'Bobby' },
        { title: '', assignedTo: 'Susan' },
        { title: 'My valid todo 3', assignedTo: 'Merry' },
      ];

      const errors = db.insertTodos(todos);

      assert.equal(errors.length, 1);
      assert.deepEqual(errors[0].input, todos[1]);
    });
  });

  describe('getAllTodos tests', () => {
    it('get an empty array if there is no Todo', () => {
      const todos = db.getAllTodos();
      assert.equal(todos.length, 0);
    });

    it('get all Todos from the Database', () => {
      const todos = [
        { title: 'My valid todo 1', assignedTo: 'Bobby' },
        { title: 'My valid todo 2', assignedTo: 'Susan' },
        { title: 'My valid todo 3', assignedTo: 'Merry' },
      ];
      db.insertTodos(todos);

      const getTodos = db.getAllTodos();
      assert.equal(getTodos.length, 3);
    });
  });

  describe('getTodoById tests', () => {
    it('get a Todo by its ID if the Todo exists', () => {
      const data = {
        title: 'My first todo',
        assignedTo: 'Bobby',
      };

      const { lastInsertRowid } = db.insertTodo(data);
      const todo = db.getTodoById(Number(lastInsertRowid)) as Todo;

      assert(todo);
      assert.equal(todo.title, data.title);
    });

    it('throws a DatabaseError if the id does not exist', () => {
      assert.throws(
        () => {
          const res = db.getTodoById(-1);
          console.log(res);
        },
        DatabaseError,
        'Error: there is no Todo that matches the provided ID'
      );
    });
  });
});
