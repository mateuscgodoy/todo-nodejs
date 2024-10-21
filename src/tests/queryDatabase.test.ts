import { before, beforeEach, describe, it } from 'node:test';
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
      const todos = db.getTodos();
      assert.equal(todos.length, 0);
    });

    describe('add default todo data to the database', () => {
      const todos = [
        { title: 'Buy milk', assignedTo: 'Bobby' },
        { title: 'Buy some eggs', assignedTo: 'Bobby' },
        { title: 'Call mom', assignedTo: 'Me' },
      ];
      beforeEach(() => {
        db.insertTodos(todos);
      });

      it('get all Todos from the Database', () => {
        const getTodos = db.getTodos();
        assert.equal(getTodos.length, 3);
      });

      it('correctly filters Todos by title', () => {
        const getTodos = db.getTodos({ title: 'Buy' });
        assert.equal(getTodos.length, 2);
      });

      it('correctly filters Todos by assignedTo', () => {
        const bobbyTodos = db.getTodos({ assignedTo: 'Bobby' });
        assert.equal(bobbyTodos.length, 2);
      });

      it('correctly gets an Todo by providing a valid ID', () => {
        const todo = db.getTodos({ id: 2 })[0];
        assert.equal(todo.title, 'Buy some eggs');
      });

      it('correctly returns undefined for unknown IDs', () => {
        const todo = db.getTodos({ id: -1 })[0];
        assert.equal(todo, undefined);
      });
    });
  });
});
