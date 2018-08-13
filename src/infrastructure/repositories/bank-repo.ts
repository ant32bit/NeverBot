import * as sqlite3 from "sqlite3";
import { ConfigService } from "../services/config-service";
import { IBankAccount } from "../dtos/bank-account";

export class BankRepository {
    private _db: sqlite3.Database;

    constructor() {
        const dbLocation = ConfigService.GetGlobalConfig().db;
        this._db = new sqlite3.Database(dbLocation);
        this._db.run(
            `CREATE TABLE IF NOT EXISTS bank (
                id integer PRIMARY KEY,
                user text NOT NULL,
                amount integer NOT NULL,
                lastDaily integer NOT NULL,
                dailyStreak integer NOT NULL
            )`
        );
    }

    public update(acc: IBankAccount, f?: (err: Error) => void) {
        this.get(acc.user, (entry) => {
            if (entry.id) {
                this._db.run(
                    `UPDATE bank
                        SET amount = ?,
                            lastDaily = ?,
                            dailyStreak = ?
                      WHERE user = ?`,
                    [acc.amount, acc.lastDaily, acc.dailyStreak, acc.user], f);
            } else {
                this._db.run(
                    `INSERT INTO bank (user, amount, lastDaily, dailyStreak) VALUES(?, ?, ?, ?)`, 
                    [acc.user, acc.amount, acc.lastDaily, acc.dailyStreak], f);
            }
        })
    }

    public get(user: string, f: (acc: IBankAccount) => void) {
        
        this._db.all(`SELECT * FROM bank WHERE user = ?`, [user], (err, rows) => {
            const acc = !err && rows.length > 0 ? rows[0] : <IBankAccount>{
                user: user,
                amount: 0, 
                lastDaily: 0,
                dailyStreak: 0
            };

            f(acc);
        });
    }
}

