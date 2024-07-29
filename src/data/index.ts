import fs from 'fs/promises';
import path from 'path';
import todoEmitter from '../lib/eventEmitter.js';
import { Todo } from '../core/index.js';

const filePath = path.join(__dirname, 'todos.txt');

const saveTodosToFile = async (todos: Todo[]) => {
  await fs.writeFile(filePath, JSON.stringify(todos, null, 2));
};

const readTodosFromFile = async (): Promise<Todo[]> => {
  let data;
  try {
    data = await fs.readFile(filePath, 'utf8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('File does not exist yet.');
    } else {
      throw error;
    }
  } finally {
    const todos = JSON.parse(data ? data : '[]');
    return todos;
  }
};

function buildTodo(task: string): Todo {
  return { id: Date.now(), text: task, completed: false };
}

todoEmitter.on('start', async () => {
  try {
    const fileHandler = await fs.open(filePath);
    await fileHandler.close();
  } catch (error: any) {
    if (error.code === 'ENOENT') await fs.writeFile(filePath, '');
    else throw error;
  }
});

todoEmitter.on('todoAdded', async (task: string) => {
  const todos = await readTodosFromFile();
  todos.push(buildTodo(task));
  await saveTodosToFile(todos);
  todoEmitter.emit('operationSucceed', '🆕 To-Do added with success!');
});

todoEmitter.on('todoCompleted', async (id: number) => {
  const todos = await readTodosFromFile();
  const index = todos.findIndex((td) => td.id === id);
  if (index === -1)
    throw new Error('Error: To-Do not found operation aborted.');
  todos[index].completed = true;
  await saveTodosToFile(todos);
  todoEmitter.emit('operationSucceed', '✅ To-Do completed with success!');
});

todoEmitter.on('todoRemoved', async (id: number) => {
  let todos = await readTodosFromFile();
  todos = todos.filter((td) => td.id !== id);
  await saveTodosToFile(todos);
  todoEmitter.emit('operationSucceed', '🗑️ To-Do removed with success!');
});

todoEmitter.on('printTodos', async (cb) => {
  try {
    let todos = await readTodosFromFile();
    cb(todos);
    todoEmitter.emit('operationSucceed');
  } catch (error) {
    throw error;
  }
});

export const findTodoById = async (id: number): Promise<Todo | null> => {
  const todos = await readTodosFromFile();
  const index = todos.findIndex((td) => td.id === id);
  if (index === -1) return null;
  return todos[index];
};
