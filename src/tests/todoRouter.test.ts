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
    it('returns all Todos stored on the application with 200 status', async () => {
      const response = await request.get('/todos');

      assert.equal(response.status, 200);
      assert.equal(response.body.length, 10);
    });
  });

  describe('GET /todos/:id', () => {
    it('returns the specific todo if the ID is valid', async () => {
      const response = await request.get('/todos/' + 1);

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
      assert.equal(response.body.message, 'The ID provided is invalid');
    });
  });

  describe('POST /todos', () => {
    it('successfully create a new todo with 201 status', async () => {
      const response = await request
        .post('/todos')
        .send({ title: 'A valid Todo', assignedTo: 'John' });

      assert.equal(response.status, 201);
      assert.equal(response.body.message, 'Todo created with success');
    });

    it('fails the creation without a title with status 400 and an error message', async () => {
      const response = await request
        .post('/todos')
        .send({ assignedTo: 'Bobby' });

      assert.equal(response.status, 400);
      assert.equal(
        response.body.message,
        'Please provide a title and an assigned person'
      );
    });

    it('fails the creation without a assignedTo with status 400 and error message', async () => {
      const response = await request
        .post('/todos')
        .send({ title: 'An invalid todo' });

      assert.equal(response.status, 400);
      assert.equal(
        response.body.message,
        'Please provide a title and an assigned person'
      );
    });
  });

  describe('UPDATE /todos', () => {
    // TODO: Implement update integration tests
  });

  describe('DELETE /todos/:id', () => {
    // TODO: Implement delete integration tests
  });
});
