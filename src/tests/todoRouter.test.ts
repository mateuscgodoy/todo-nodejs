import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent.js';
import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';

import todoTestApp from './todoTestApp.js';
import testTodos from './todoTestData.js';

let request: TestAgent;

describe('TodoRouter', () => {
  beforeEach(() => {
    // Testing data already added to the application
    request = supertest(todoTestApp);
  });

  describe('GET /todos', () => {
    // TODO: Add tests for filtering options

    it('returns all Todos stored on the application with 200 status', async () => {
      const response = await request.get('/todos');

      assert.equal(response.status, 200);
      assert.equal(response.body.length, 10);
    });
  });

  describe('GET /todos/:id', () => {
    it('returns the specific todo if the ID is valid', async () => {
      const response = await request.get('/todos/1');

      assert.equal(response.status, 200);
      assert.equal(response.body.title, testTodos[0].title);
    });

    it('fails when a inexistent ID is provided with 404 status and an error message', async () => {
      const response = await request.get('/todos/-1');

      assert.equal(response.status, 404);
      assert.equal(
        response.body.message,
        'No Todo was found for the provided id.'
      );
    });

    it('fails when an invalid ID is provided with 400 status and an error message', async () => {
      const response = await request.get('/todos/bacon');

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'The ID parameter must be a number');
    });
  });

  describe('POST /todos', () => {
    it('successfully create a new todo with 201 status', async () => {
      const todo = { title: 'A valid Todo ⭐!', assignedTo: 'John' };
      const response = await request.post('/todos').send({ todo });

      assert.equal(response.status, 201);
      assert.equal(response.body.message, 'Todo created with success');
    });

    it('fails the creation without a title with status 400 and an error message', async () => {
      const todo = { assignedTo: 'Bobby' };
      const response = await request.post('/todos').send({ todo });

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'Todo title text is required');
    });

    it('fails the creation without a assignedTo with status 400 and error message', async () => {
      const todo = { title: 'An invalid todo' };
      const response = await request.post('/todos').send({ todo });

      assert.equal(response.status, 400);
      assert.equal(
        response.body.message,
        'An assigned persons name is required'
      );
    });

    it('fails the creation if not Todo exists on the request body', async () => {
      const response = await request.post('/todos').send();

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'The Todo sent is invalid');
    });

    it('fails when the title contains potentially harmful characters', async () => {
      const todo = {
        title: 'This todo has <script>dangerous code</script>',
        assignedTo: 'Bob',
      };

      const response = await request.post('/todos').send({ todo });

      assert.equal(response.status, 400);
      assert.equal(
        response.body.message,
        'Todo title contain invalid characters'
      );
    });
  });

  describe('UPDATE /todos/:id', () => {
    it('successfully update a valid todo', async () => {
      const todo = { ...testTodos[0], done: true };
      const response = await request.patch('/todos/1').send({ todo });

      assert.equal(response.status, 200);
      assert.equal(response.body.message, 'Todo updated with success');
      assert.equal(response.body.todo.done, true);
    });

    it('succeeds even when there is no information passed', async () => {
      const response = await request.patch('/todos/1').send({ todo: {} });

      assert.equal(response.status, 200);
      assert.equal(response.body.message, 'Todo updated with success');
    });

    it('fails if the provided ID does not exist with a 404 status and an error message', async () => {
      const response = await request.patch('/todos/-1').send({ todo: {} });

      assert.equal(response.status, 404);
      assert.equal(
        response.body.message,
        'No Todo was found for the provided id.'
      );
    });
  });

  // describe('DELETE /todos/:id', () => {
  //   // TODO: Implement delete integration tests
  // });
});
