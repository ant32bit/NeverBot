import * as sqlite3 from "sqlite3";
import { ConfigService } from "../services/config-service";

const _cache: {[id: string]: {[itemId: string]: number}} = {};

export enum InventoryActionStatus {
    SUCCESS,
    NOT_ENOUGH
}

export class InventoryRepository {
    private _db: sqlite3.Database;

    constructor() {

        const dbLocation = ConfigService.GetGlobalConfig().db;
        this._db = new sqlite3.Database(dbLocation);
        this._db.run(
            `CREATE TABLE IF NOT EXISTS inventories (
                id integer PRIMARY KEY,
                user text NOT NULL,
                item text NOT NULL,
                amount integer NOT NULL
            )`
        );
    }


    public get(id: string, f: (inventory: {[itemId: string]: number}) => void) {
        if (_cache[id]) {
            f(this._getFromCache(id));
        }
        else {
            this._getFromDb(id, i => {
                
                this._updateCache(id, i);
                f(i);
            });
        }
    }

    public add(user: string, itemId: string, amount: number, f?: (err: InventoryActionStatus) => void) {

        this.get(user, inv => {
            if (amount < 0 && (inv[itemId] == null || inv[itemId] + amount < 0)) {
                if (f) {
                    f(InventoryActionStatus.NOT_ENOUGH);
                    return;
                }
            }
    
            if (inv[itemId] == null) {
                inv[itemId] = 0;
            }
    
            inv[itemId] += amount;
    
            const newInventory: {[itemId: string]: number} = {};
            for (let item of Object.keys(inv)) {
                if (inv[itemId] > 0) {
                    newInventory[item] = inv[item];
                }
            } 
    
            if (Object.keys(newInventory).length > 0) {

                this._updateDb(user, newInventory);
                this._updateCache(user, newInventory)
            }
            else {
                delete _cache[user];
                this._updateDb(user, null);
            }

            if (f) {
                f(InventoryActionStatus.SUCCESS);
                return;
            }
        })        
    }

    public take(user: string, itemId: string, amount: number, f?: (err: InventoryActionStatus) => void) {
        this.add(user, itemId, amount * -1, f);
    }

    private _updateDb(user: string, inventory: {[itemId: string]: number}, f?: (err: Error) => void) {

        this._db.run(`DELETE FROM inventories WHERE user = ?`, [user], err => {
            if (inventory != null) {
                const valueSets = [];
                const values = [];
    
                for (let itemId of Object.keys(inventory)) {
                    if (inventory[itemId] > 0) {
                        valueSets.push('(?, ?, ?)');
                        values.push(user, itemId, inventory[itemId]);
                    }
                }

                if (values.length > 0) {
                    this._db.run(`INSERT INTO inventories (user, item, amount) VALUES ${valueSets.join(',')}`, values);
                }
            }
        });
    }

    private _getFromDb(user: string, f: (inventory: {[itemId: string]: number}) => void) {
        
        this._db.all(`SELECT * FROM inventories WHERE user = ?`, [user], (err, rows: IInventory[]) => {
            f(!err && rows.length > 0 ? rows.reduce((res, row) => { res[row.item] = row.amount; return res; }, {}) : {});
        });
    }

    private _updateCache(id: string, inventory: {[itemId: string]: number}) {
        _cache[id] = {...inventory};
    }

    private _getFromCache(id: string): {[itemId: string]: number} {
        const cacheObj = _cache[id];
        
        if (cacheObj == null) {
            return null;
        }
        
        return {...cacheObj};
    }
}

interface IInventory {
    id?: number;
    user: string;
    item: string;
    amount: number;
}