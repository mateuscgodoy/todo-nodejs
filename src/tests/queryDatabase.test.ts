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
      const todosData = [
        { title: 'Buy milk', assignedTo: 'Bobby' },
        { title: 'Buy some eggs', assignedTo: 'Bobby' },
        { title: 'Call mom', assignedTo: 'Me' },
        { title: 'Buy flour', assignedTo: 'Me' },
      ];
      beforeEach(() => {
        db.insertTodos(todosData);
      });

      it('get all Todos from the Database', () => {
        const todos = db.getTodos();
        assert.equal(todos.length, 4);
      });

      it('correctly filters Todos by title', () => {
        const todos = db.getTodos({ title: 'Buy' });
        assert.equal(todos.length, 3);
      });

      it('correctly filters Todos by assignedTo', () => {
        const bobbyTodos = db.getTodos({ assignedTo: 'Bobby' });
        assert.equal(bobbyTodos.length, 2);
      });

      it('correctly filters Todos by title and assignedTo', () => {
        const todos = db.getTodos({ title: 'Buy', assignedTo: 'Me' });
        assert.equal(todos.length, 1);
        assert.equal(todos[0].assignedTo, todosData[3].assignedTo);
        assert.equal(todos[0].title, todosData[3].title);
      });

      it('correctly gets an Todo by providing a valid ID', () => {
        const todo = db.getTodos({ id: 2 })[0];
        assert.equal(todo.title, 'Buy some eggs');
      });

      it('correctly returns undefined for unknown IDs', () => {
        const todo = db.getTodos({ id: -1 })[0];
        assert.equal(todo, undefined);
      });

      it('correctly filters Todos respecting the limit value', () => {
        const todos = db.getTodos({ limit: 2 });
        assert.equal(todos.length, 2);
      });

      it('correctly returns todos based on the provider offset', () => {
        const todos = db.getTodos({ limit: 2, offset: 1 });
        assert.equal(todos.length, 2);
        assert.equal(todos[0].title, todosData[1].title);
        assert.equal(todos[1].title, todosData[2].title);
      });

      it('correctly returns todos filtered by title, limit and offset', () => {
        const todos = db.getTodos({ title: 'Buy', limit: 2, offset: 1 });
        assert.equal(todos.length, 2);
        assert.equal(todos[0].title, todosData[1].title);
        assert.equal(todos[1].assignedTo, todosData[3].assignedTo);
      });

      it('throws a DatabaseError if offset is used without a limit', () => {
        assert.throws(
          () => {
            const todos = db.getTodos({ offset: 10 });
          },
          DatabaseError,
          'Error: Offset can not be set without a valid limit'
        );
      });
    });
  });

  describe('updateTodo test', () => {
    beforeEach(() => {
      db.insertTodo({ title: 'Buy milk', assignedTo: 'Bobby' });
    });

    it('update a todo given valid data', () => {
      let todo = db.getTodos({ id: 1 })[0];
      todo.done = true;
      db.updateTodo(todo);
      todo = db.getTodos({ id: 1 })[0];

      assert.equal(todo.done, true);
    });

    it('throws DatabaseError if Todo to update is invalid', () => {
      const todo: Todo = {
        id: 20,
        title: 'A not registered todo',
        assignedTo: 'ChatGPT',
        done: true,
      };

      assert.throws(
        () => {
          db.updateTodo(todo);
        },
        DatabaseError,
        'Error: the Todo provided is invalid'
      );
    });
  });

  describe('deleteTodo test', () => {
    it('delete a todo given a valid ID', () => {
      db.insertTodo({ title: 'A valid Todo', assignedTo: 'Bobby' });
      db.deleteTodo(1);
      const todo = db.getTodos({ id: 1 })[0];
      assert.equal(todo, undefined);
    });

    it('throws a DatabaseError if the given ID is invalid', () => {
      assert.throws(
        () => {
          db.deleteTodo(100);
        },
        DatabaseError,
        'Error: the provided ID is invalid'
      );
    });
  });
});
