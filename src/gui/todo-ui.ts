import { input } from '@inquirer/prompts';
import { todoValidation } from '../core/index.js';
import todoEmitter from '../lib/eventEmitter.js';
import { Todo } from '../core/index.js';

const addTodo = async () => {
  const task = await input({
    message: 'Enter your To-Do task:',
    validate: todoValidation.validateToDoText,
  });
  todoEmitter.emit('todoAdded', task);
};

const completeTodo = async () => {
  const id = await getIdAsync('Enter the To-Do ID you would like to complete:');
  todoEmitter.emit('todoCompleted', Number(id));
};

const removeTodo = async () => {
  const id = await getIdAsync('Enter the To-Do ID you would like to remove:');
  todoEmitter.emit('todoRemoved', Number(id));
};

const getIdAsync = async (message?: string) => {
  return await input({
    message: message || 'Enter todo:',
    validate: todoValidation.validateToDoId,
  });
};

const printTodos = (todos: Todo[]) => {
  for (const todo of todos) {
    console.log(
      `ID: ${todo.id} - ${todo.text} - ${
        todo.completed ? '[✅ COMPLETED]' : '❌'
      }`
    );
  }
};

export const uiTodo = {
  addTodo,
  completeTodo,
  removeTodo,
  printTodos,
};
