import * as sqlite3 from "sqlite3";
import { ConfigService } from "../services/config-service";
import { IWarning } from "../dtos/warning";


const _dayInMs = 1000 * 60 * 60 * 24;
const _warnings: IWarning[] = [];

export class WarningRepository {
    private _db: sqlite3.Database;

    constructor() {
        const dbLocation = ConfigService.GetGlobalConfig().db;
        this._db = new sqlite3.Database(dbLocation);
        this._db.run(`CREATE TABLE IF NOT EXISTS warnings (
            id integer PRIMARY KEY,
            server text NOT NULL,
            user text NOT NULL,
            reason text NOT NULL,
            date integer NOT NULL
        )`);
    }

    public add(server: string, user: string, reason: string) {

        this._db.run(
            `INSERT INTO warnings (server, user, reason, date) VALUES(?, ?, ?, ?)`, 
            [server, user, reason, Date.now()]);
    }

    public delete(id: number) {
        this._db.run(`DELETE FROM warnings WHERE id = ?`, [id]);
    }

    public getByUser(server: string, user: string, f: (err: Error, warnings: IWarning[]) => void) {

        this._db.all(
            `SELECT * FROM warnings WHERE server = ? AND user = ? AND date > ? ORDER BY date`,
            [server, user, this._validFrom()],
            f
        );
    }

    public get(server: string, f: (err: Error, warnings: IWarning[]) => void) {
        
        this._db.all(
            `SELECT * FROM warnings WHERE server = ? AND date > ? ORDER BY date`,
            [server, this._validFrom()],
            f
        );
    }

    private _validFrom(): number {
        const today = new Date(new Date(Date.now()).toDateString()).getTime();
        const days = new Date(today).getDay();

        return today - (days * _dayInMs);
    }
}