import express, { Request, Response } from 'express';

import QueryDatabase, { DatabaseError, Todo } from './queryDatabase.js';
import {
  isValidTodoId,
  isValidPostTodo,
  isValidUpdateTodo,
} from './validators.js';
import { catchErrors } from './catchErrorsMiddleware.js';
import { getTodoById } from './getTodoByIdMiddleware.js';

export default class TodoRouter {
  private _router = express.Router();
  private db: QueryDatabase;

  constructor(db: QueryDatabase) {
    this.db = db;
    this._router.post(
      '',
      isValidPostTodo,
      catchErrors,
      this.postTodoRoute.bind(this)
    );
    this._router.get('', this.getAllTodosRoute.bind(this));
    this._router.get(
      '/:id',
      isValidTodoId,
      catchErrors,
      getTodoById(this.db),
      this.getTodoById.bind(this)
    );
    this._router.patch(
      '/:id',
      isValidTodoId,
      isValidUpdateTodo,
      catchErrors,
      getTodoById(this.db),
      this.updateTodo.bind(this)
    );
    this._router.delete(
      '/:id',
      isValidTodoId,
      catchErrors,
      getTodoById(this.db),
      this.deleteTodo.bind(this)
    );
  }

  get router() {
    return this._router;
  }

  /**
   * @swagger
   * /todos:
   *   post:
   *     summary: Create a new Todo
   *     description: Add a new Todo item to the list.
   *     tags: [Todos]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: The title of the Todo
   *                 example: "Fix the router"
   *               assignedTo:
   *                 type: string
   *                 description: The person assigned to the task
   *                 example: "John Doe"
   *     responses:
   *       201:
   *         description: Todo created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 todo:
   *                   $ref: '#/components/schemas/Todo'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  postTodoRoute(req: Request, res: Response) {
    const { title, assignedTo } = req.body.todo;
    this.db.insertTodo({ title, assignedTo });
    return res
      .status(201)
      .send({ message: 'Todo created with success', title, assignedTo });
  }

  /**
   * @swagger
   * /todos:
   *   get:
   *     summary: List all todo items
   *     tags:
   *       - Todos
   *     parameters:
   *       - in: query
   *         name: title
   *         schema:
   *           type: string
   *         required: false
   *         description: Filter by title
   *       - in: query
   *         name: assignedTo
   *         schema:
   *           type: string
   *         required: false
   *         description: Filter by assignedTo
   *     responses:
   *       200:
   *         description: A list of todo items
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Todo'
   */
  getAllTodosRoute(req: Request, res: Response) {
    // TODO: add filtering for Limit, Offset, Title and Assigned To query parameters

    const todos = this.db.getTodos();
    res.status(200).send(todos);
  }

  /**
   * @swagger
   * /todos/{id}:
   *   get:
   *     summary: Get a Todo by ID
   *     description: Retrieve a specific Todo item by its unique ID.
   *     tags: [Todos]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The ID of the Todo to retrieve
   *         example: 1
   *     responses:
   *       200:
   *         description: The requested Todo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Todo'
   *       400:
   *         description: Invalid ID supplied
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 id:
   *                   type: integer
   *                   description: The invalid ID provided
   *       404:
   *         description: Todo not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 id:
   *                   type: integer
   *                   description: The invalid ID provided
   */
  getTodoById(req: Request, res: Response) {
    const { dbTodo } = req.body;
    res.status(200).send({ todo: dbTodo });
  }

  /**
   * @swagger
   * /todos:
   *   patch:
   *     summary: Update a todo
   *     description: Update a todo from the database.
   *     tags: [Todos]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               todo:
   *                 $ref: '#/components/schemas/Todo'
   *     responses:
   *       202:
   *         description: Todo updated with success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  updateTodo(req: Request, res: Response) {
    const { todo, dbTodo } = req.body;
    const updatedTodo = { ...dbTodo, ...todo };

    try {
      this.db.updateTodo(updatedTodo);
      res
        .status(200)
        .send({ message: 'Todo updated with success', todo: updatedTodo });
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(400).send({ message: 'The informed Todo is invalid' });
      } else {
        res.status(500).send({ message: 'Internal server error', error });
      }
    }
  }

  /**
   * @swagger
   * /todos/{id}:
   *   delete:
   *     summary: Delete a todo item
   *     tags:
   *       - Todos
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the todo item
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Todo item deleted successfully
   *       404:
   *         description: Todo item not found
   *       400:
   *         description: Bad ID input provided
   */
  deleteTodo(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      this.db.deleteTodo(id);
      return res.status(200).send({ message: 'Todo was deleted with success' });
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(404).send({ message: 'Todo to delete was not found' });
      } else {
        res.status(500).send({ message: 'Internal server error', error });
      }
    }
  }
}
