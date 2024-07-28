import EventEmitter from 'events';
class ToDoEventEmitter extends EventEmitter {}
const todoEmitter = new ToDoEventEmitter();
export default todoEmitter;
