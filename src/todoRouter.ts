import express from 'express';
import sqlite from 'sqlite3';

type Todo = {
  id: number;
  title: string;
  assignedTo: string;
  done: boolean;
};

type TodoDBM = {
  id: number;
  title: string;
  assignedTo: string;
  done: number;
};

export default class TodoRouter {
  private _router = express.Router();
  private db: sqlite.Database;

  constructor(db: sqlite.Database) {
    this.db = db;
    this.setPostTodo();
    this.setGetAllTodos();
    this.setGetTodoById();
  }

  public get router() {
    return this._router;
  }

  /**
   * @swagger
   * tags:
   *   - name: Todos
   *     description: API for managing todo items
   */

  private setPostTodo() {
    /**
     *
     * @swagger
     * /todos:
     *   post:
     *     summary: Create a new todo item
     *     tags:
     *       - Todos
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - assignedTo
     *             properties:
     *               title:
     *                 type: string
     *               assignedTo:
     *                 type: string
     *     responses:
     *       201:
     *         description: Todo item created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Todo'
     */
    this.router.post('', (req, res) => {
      const { title, assignedTo } = req.body;
      if (!title || !assignedTo) {
        return res
          .status(400)
          .json({ error: 'Title and AssignedTo are required' });
      }
      const done = 0;
      this.db.run(
        'INSERT INTO todos (title, assignedTo, done) VALUES (?, ?, ?)',
        [title, assignedTo, done],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          const id = this.lastID;
          res.status(201).json({ id, title, assignedTo, done: false });
        }
      );
    });
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
  private setGetAllTodos() {
    this.router.get('', (req, res) => {
      /**
       * WHERE clause added so further filtering parameters can be
       * simply added to the end of the query, in a way that it does
       * not matter if there is 0, 1 or more filters applied! 👏
       */
      let query = 'SELECT * FROM todos WHERE 1=1';
      const { title, assignedTo } = req.query;
      const params: any[] = [];

      if (title) {
        query += ' AND title LIKE ?';
        params.push(`%${title}%`);
      }
      if (assignedTo) {
        query += ' AND assignedTo LIKE ?';
        params.push(`%${assignedTo}%`);
      }

      this.db.all(query, params, (err: Error | null, rows: TodoDBM[]) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const todos: Todo[] = rows.map((row: TodoDBM) => ({
          ...row,
          done: !!row.done,
        }));
        res.json(todos);
      });
    });
  }

  /**
   * @swagger
   * /todos/{id}:
   *   get:
   *     summary: Get a todo item by ID
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
   *       200:
   *         description: A todo item
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Todo'
   *       404:
   *         description: Todo item not found
   */
  private setGetTodoById() {
    this.router.get('/:id', (req, res) => {
      const id = req.params.id;
      this.db.get(
        'SELECT * FROM todos WHERE id = ?',
        [id],
        (err, data: TodoDBM) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (!data) {
            return res.status(404).json({ error: 'Todo item not found' });
          }

          const todo = { ...data, done: !!data.done };
          res.json(todo);
        }
      );
    });
  }
}
