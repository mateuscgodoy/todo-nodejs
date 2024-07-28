import { rawlist } from '@inquirer/prompts';
import { uiTodo } from './todo-ui.js';
import todoEmitter from '../lib/eventEmitter.js';

type MenuUIElement = {
  name: string;
  value: string;
  action: () => void;
};

const MAIN_MENU_DATA: MenuUIElement[] = [
  { name: 'Add To-Do', value: 'add', action: uiTodo.addTodo },
  {
    name: 'Complete To-Do',
    value: 'complete',
    action: uiTodo.completeTodo,
  },
  { name: 'Remove To-Do', value: 'remove', action: uiTodo.removeTodo },
  {
    name: 'Print To-Dos',
    value: 'print',
    action: async () => {
      todoEmitter.emit('printTodos', uiTodo.printTodos);
    },
  },
  {
    name: 'Quit',
    value: 'quit',
    action: async () => {
      console.log('Bye! 👋');
    },
  },
];

const mainMenu = async () => {
  const answer = await rawlist({
    message: 'What would you like to do?',
    choices: MAIN_MENU_DATA.map((data) => {
      return { name: data.name, value: data.value };
    }),
  });

  try {
    const selected = MAIN_MENU_DATA.find((data) => data.value === answer);
    if (selected) {
      await selected?.action();
    }
  } catch (error) {
    console.log((error as Error).message);
  }
};

todoEmitter.on('operationSucceed', async (message?: string) => {
  if (message) console.log(`\n${message}\n`);
  await mainMenu();
});

todoEmitter.on('start', async () => {
  console.log(
    'Welcome to the To-Doer!\nOne of the 1 million Node.js To-Do app.\n'
  );
  await mainMenu();
});
