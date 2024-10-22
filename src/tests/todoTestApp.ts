import express from 'express';

import TodoRouter from '../todoRouter.js';
import QueryDatabase, { InputTodo } from '../queryDatabase.js';
import testTodos from './todoTestData.js';

const todoTestApp = express();
const db = new QueryDatabase(':memory:');
db.insertTodos(testTodos);
const todoRouter = new TodoRouter(db);

todoTestApp.use(express.json());
todoTestApp.use('/todos', todoRouter.router);

export default todoTestApp;
