import * as sqlite3 from "sqlite3";
import { ConfigService } from "../services/config-service";
import { IWarning } from "../dtos/warning";

export class TranslationLogRepository {
    private _db: sqlite3.Database;

    constructor() {
        const dbLocation = ConfigService.GetGlobalConfig().db;
        this._db = new sqlite3.Database(dbLocation);
        this._db.run(`CREATE TABLE IF NOT EXISTS said (
            id integer PRIMARY KEY,
            server text NOT NULL,
            user text NOT NULL,
            input text NOT NULL,
            output text,
            language text,
            date integer NOT NULL
        )`);
    }

    public log(server: string, user: string, input: string, output?: string, language?: string) {

        this._db.run(
            `INSERT INTO said (server, user, input, output, language, date) VALUES(?, ?, ?, ?, ?, ?)`, 
            [server, user, input, output, language, Date.now()]);
    }
}