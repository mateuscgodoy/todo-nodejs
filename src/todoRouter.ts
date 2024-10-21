import express, { Request, Response } from 'express';

import QueryDatabase, { DatabaseError } from './queryDatabase.js';

export default class TodoRouter {
  private _router = express.Router();
  private db: QueryDatabase;

  constructor(db: QueryDatabase) {
    this.db = db;
    this._router.post('', this.postTodoRoute.bind(this));
    this._router.get('', this.getAllTodosRoute.bind(this));
    this._router.get('/:id', this.getTodoById.bind(this));
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
    const { title, assignedTo } = req.body;
    if (!title || !assignedTo) {
      return res
        .status(400)
        .send({ message: 'Please provide a title and an assigned person' });
    }

    this.db.insertTodo({ title, assignedTo });
    res
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
    const todos = this.db.getAllTodos();
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
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .send({ message: 'The ID provided is invalid', id });
    }
    try {
      const todo = this.db.getTodoById(id);
      res.status(200).send(todo);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(404).send({
          message: 'No Todo was found for the provided id.',
          id,
        });
      }
    }
  }
}
