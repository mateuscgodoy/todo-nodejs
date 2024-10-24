import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export function catchErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const { msg } = errors.array()[0];
    return res.status(400).send({ message: msg });
  }
  next();
}
