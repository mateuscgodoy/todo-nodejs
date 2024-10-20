import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import swaggerOpts from './swaggerOpts.js';
import TodoRouter from './todoRouter.js';
import QueryDatabase from './queryDatabase.js';

const PORT = 3000;
const DB_PATH = './todos.db';
const db = new QueryDatabase(DB_PATH);
const app = express();
app.use(cors());
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerOpts));

const todoRouter = new TodoRouter(db);
app.use('/todos', todoRouter.router);

app.listen(PORT, () => {
  console.log(`Server located at: http://localhost:${PORT}`);
});
