import * as sqlite3 from "sqlite3";
import * as ConfigProvider from '../../infrastructure/config';

export class BankRepository {
    private _db: sqlite3.Database;

    constructor() {
        const dbLocation = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json').db;
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

    public update(acc: BankAccount, f?: (err: Error) => void) {
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

    public get(user: string, f: (acc: BankAccount) => void) {
        
        this._db.all(`SELECT * FROM bank WHERE user = ?`, [user], (err, rows) => {
            const acc = !err && rows.length > 0 ? rows[0] : <BankAccount>{
                user: user,
                amount: 0, 
                lastDaily: 0,
                dailyStreak: 0
            };

            f(acc);
        });
    }
}

export class BankAccount {
    id?: number;
    user: string;
    amount: number;
    lastDaily: number;
    dailyStreak: number;
}