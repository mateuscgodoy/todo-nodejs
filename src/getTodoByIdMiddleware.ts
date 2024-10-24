import { NextFunction, Request, Response } from 'express';
import QueryDatabase from './queryDatabase.js';

export function getTodoById(db: QueryDatabase) {
  return function (req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);
    const dbTodo = db.getTodos({ id })[0];
    if (!dbTodo) {
      return res.status(404).send({
        message: 'No Todo was found for the provided id',
        id,
      });
    }
    req.body.dbTodo = dbTodo;
    next();
  };
}
