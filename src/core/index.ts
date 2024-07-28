import todoEmitter from '../lib/eventEmitter.js';
import { findTodoById } from '../file/index.js';

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const validateToDoText = (text: string): boolean | string => {
  if (!text || text.length === 0)
    return 'Error: a To-Do must have some text information.';
  return true;
};

const validateToDoId = (id: string): boolean | string => {
  const numID = Number(id);
  if (isNaN(numID)) return 'Error: the ID value must be a number.';
  if (!findTodoById(numID)) return 'Error: the provided ID is invalid.';
  return true;
};

export const todoValidation = { validateToDoId, validateToDoText };
