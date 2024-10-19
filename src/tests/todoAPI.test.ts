import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import express, { request } from 'express';

import TodoRouter from '../todoRouter.js';
import TodoDB from '../db.js';

let app: express.Application;

//--experimental-test-coverage

describe('TodoRouter', () => {
  describe('POST /todos', () => {
    before(() => {
      const db = new TodoDB(':memory:');
      const router = new TodoRouter(db.instance);
      app = express();
      app.use(express.json());
      app.use('/todos', router.router);
    });

    it('succeeds POST todo with a valid payload', async () => {
      const payload = {
        title: 'My new todo',
        assignedTo: 'Bobby',
      };
      const response = await supertest(app).post('/todos').send(payload);
      const { title, assignedTo } = response.body;
      assert.equal(response.status, 201);
      assert.equal(title, payload.title);
      assert.equal(assignedTo, payload.assignedTo);
    });

    it('fails POST todo without a title with 400 status', async () => {
      const payload = {
        assignedTo: 'Bobby',
      };
      const response = await supertest(app).post('/todos').send(payload);

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Title and AssignedTo are required');
    });

    it('fails POST todo without a assignedTo with 400 status', async () => {
      const payload = {
        title: 'A failing todo',
      };
      const response = await supertest(app).post('/todos').send(payload);

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Title and AssignedTo are required');
    });
  });
});
