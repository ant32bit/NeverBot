import * as sqlite3 from "sqlite3";
import { ConfigService } from "../services/config-service";
import { IPlayer, PlayerResource, IBuff } from "../dtos";
import { QueryDispatcher, GetLevelQuery } from "../cqrs";
import { ILevelData } from "../configs";

const _cache: {[id: string]: IPlayerCache} = {};


export class PlayerRepository {
    private _db: sqlite3.Database;
    private _queryDispatcher: QueryDispatcher;

    constructor() {
        this._queryDispatcher = new QueryDispatcher();

        const dbLocation = ConfigService.GetGlobalConfig().db;
        this._db = new sqlite3.Database(dbLocation);
        this._db.run(
            `CREATE TABLE IF NOT EXISTS players (
                id integer PRIMARY KEY,
                user text NOT NULL,
                xp integer NOT NULL
            )`
        );
    }


    public get(id: string, f: (player: IPlayer) => void) {
        const now = Date.now();

        if (_cache[id]) {
            const player = this._getFromCache(id, now);
            f(player);
        }
        else {
            this._getFromDb(id, p => {

                const levelData = this._queryDispatcher.dispatch<ILevelData>(new GetLevelQuery(p.xp));

                const player = <IPlayer> {
                    id: p.user,
                    level: levelData.level,
                    xp: p.xp,
                    hp: new PlayerResource(levelData.hp_max, levelData.hp_max, levelData.hp_rate),
                    ap: new PlayerResource(levelData.ap_max, levelData.ap_max, levelData.ap_rate),
                    atk: { min: levelData.atk_min, max: levelData.atk_max },
                    crit: { rate: levelData.crit_rate, mult: levelData.crit_mult },
                    lastCalc: now,
                    buffs: []
                };

                this._updateCache(player);

                f(player);
            });
        }
    }

    public update(data: IPlayer) {

        this.get(data.id, player => {
            
            if (player.xp !== data.xp) {
                this._updateDb({
                    user: data.id,
                    xp: data.xp
                });
            }

            this._updateCache(data);
        });
    }

    private _updateDb(player: IPlayerData, f?: (err: Error) => void) {
        this._getFromDb(player.user, entry => {
            if (entry.id) {
                this._db.run(
                    `UPDATE players
                        SET xp = ?
                      WHERE user = ?`,
                    [player.xp, player.user], f);
            } else {
                this._db.run(
                    `INSERT INTO players (user, xp) VALUES(?, ?)`, 
                    [player.user, player.xp], f);
            }
        })
    }

    private _getFromDb(user: string, f: (player: IPlayerData) => void) {
        
        this._db.all(`SELECT * FROM players WHERE user = ?`, [user], (err, rows) => {
            f(!err && rows.length > 0 ? rows[0] : <IPlayerData>{ user: user, xp: 0 });
        });
    }

    private _applyBuffs(player: IPlayer) {
        var buffs = [...player.buffs];

        for (const buff of buffs) {
           // ModifierUpdater.applyBuff(player, buff);
        }
    }

    private _updateCache(player: IPlayer) {
        _cache[player.id] = {
              data: { user: player.id, xp: player.xp },
              level: this._queryDispatcher.dispatch<ILevelData>(new GetLevelQuery(player.xp)),
              currHp: player.hp.curr,
              currAp: player.ap.curr,
              lastCalc: player.lastCalc,
              buffs: [...player.buffs]
        };
    }

    private _getFromCache(id: string, time: number): IPlayer {
        const cacheObj = _cache[id];
        
        if (cacheObj == null) {
            return null;
        }

        const player = {
            id: cacheObj.data.user,
            level: cacheObj.level.level,
            xp: cacheObj.data.xp,
            hp: new PlayerResource(cacheObj.currHp, cacheObj.level.hp_max, cacheObj.level.hp_rate),
            ap: new PlayerResource(cacheObj.currAp, cacheObj.level.ap_max, cacheObj.level.ap_rate),
            atk: { min: cacheObj.level.atk_min, max: cacheObj.level.atk_max },
            crit: { rate: cacheObj.level.crit_rate, mult: cacheObj.level.crit_mult },
            lastCalc: cacheObj.lastCalc,
            buffs: [...cacheObj.buffs]
        }

        this._calcToDate(player, time);
        return player;
    }

    private _calcToDate(player: IPlayer, time: number) {
        const minutesElapsed = (time - player.lastCalc) / 60000;

        player.hp = this.updateResource(player.hp, minutesElapsed);
        player.ap = this.updateResource(player.ap, minutesElapsed);
        this._applyBuffs(player);
        player.lastCalc = time;
    }

    private updateResource(resource: PlayerResource, minutes: number): PlayerResource {
        resource.curr = resource.curr + resource.rate * minutes;
        if (resource.curr > resource.max) {
            resource.curr = resource.max;
        }

        return resource;
    }
}

interface IPlayerData {
    id?: number;
    user: string;
    xp: number;
}

interface IPlayerCache {
    data: IPlayerData;
    level: ILevelData;
    currHp: number;
    currAp: number;
    lastCalc: number;
    buffs: IBuff[];
}