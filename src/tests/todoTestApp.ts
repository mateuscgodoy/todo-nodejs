import express from 'express';

import TodoRouter from '../todoRouter.js';
import QueryDatabase, { InputTodo } from '../queryDatabase.js';

const todoTestApp = express();
const db = insertTestingTodosData(new QueryDatabase(':memory:'));
const todoRouter = new TodoRouter(db);

todoTestApp.use(express.json());
todoTestApp.use('/todos', todoRouter.router);

export default todoTestApp;

function insertTestingTodosData(db: QueryDatabase): QueryDatabase {
  const testTodos: InputTodo[] = [
    { title: 'Finish project report', assignedTo: 'Alice' },
    { title: 'Prepare presentation', assignedTo: 'Bob' },
    { title: 'Fix login bug', assignedTo: 'Charlie' },
    { title: 'Design homepage layout', assignedTo: 'Diana' },
    { title: 'Update user profile feature', assignedTo: 'Bob' },
    { title: 'Refactor authentication module', assignedTo: 'Frank' },
    { title: 'Set up CI/CD pipeline', assignedTo: 'Alice' },
    { title: 'Test mobile responsiveness', assignedTo: 'Heidi' },
    { title: 'Write unit tests for API', assignedTo: 'Bob' },
    { title: 'Deploy application to production', assignedTo: 'Diana' },
  ];
  db.insertTodos(testTodos);
  return db;
}
