import { findTodoById } from "../models/index.js";

const validateToDoText = (text: string): boolean | string => {
  if (!text || text.length === 0)
    return "Error: a To-Do must have some text information.";
  return true;
};

const validateToDoId = async (
  id: string,
  cb?: () => {}
): Promise<boolean | string> => {
  const numID = Number(id);
  if (isNaN(numID)) return "Error: the ID value must be a number.";
  const todo = await findTodoById(numID);
  if (!todo) return "Error: the provided ID is invalid.";
  return true;
};

export const todoValidation = { validateToDoId, validateToDoText };
