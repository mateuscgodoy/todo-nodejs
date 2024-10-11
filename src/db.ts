import { Database } from 'sqlite3';

export default class TodoDB {
  private static instance: Database;

  static getDb(dbPath: string): Database {
    if (!TodoDB.instance) {
      TodoDB.instance = new Database(dbPath, (err) => {
        if (err) {
          console.error(
            'Operation aborted: could not connect to SQLite database',
            err
          );
          return;
        }
        console.log('Operation complete: Connected to SQLite database');
      });

      TodoDB.instance.run(`CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          assignedTo TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0
        )`);
    }
    return TodoDB.instance;
  }
}
