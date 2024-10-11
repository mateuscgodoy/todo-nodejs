import sqlite from 'sqlite3';

export default class TodoDB {
  private _instance: sqlite.Database;

  public get instance(): sqlite.Database {
    return this._instance;
  }

  constructor(dbPath: string) {
    this._instance = new sqlite.Database(dbPath, (err) => {
      if (err) {
        console.error(
          'Operation aborted: could not connect to SQLite database',
          err
        );
        return;
      }
      console.log('Operation complete: Connected to SQLite database');
    });
    this._instance.run(`CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          assignedTo TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0
        )`);
  }
}
