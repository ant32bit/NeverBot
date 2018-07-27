import { GameDataRepo } from "./gamedata";
import * as ModifierUpdater from "./modifiers";


const _players: {[id: string]: PlayerData} = {};
const _playerDailies: {[id: string]: Date} = {};

export class PlayersRepo {
    private _gamedata: GameDataRepo = new GameDataRepo();
    
    public getDaily(id: string): boolean {
        
        const rn = new Date(Date.now());

        if (!_playerDailies[id]) {
            _playerDailies[id] = rn;
            return true;
        }
        else {
            if (rn.getUTCFullYear() > _playerDailies[id].getUTCFullYear() ||
                rn.getUTCMonth() > _playerDailies[id].getUTCMonth() ||
                rn.getUTCDate() > _playerDailies[id].getUTCDate()) {

                _playerDailies[id] = rn;
                return true;
            }
        }

        _playerDailies[id] = rn;
        return false;
    }

    public getPlayer(id: string): Player {
        const now = Date.now();

        const playerData = this.getPlayerData(id);
        const level = this._gamedata.GetLevelData(playerData.level);

        const minutesSinceCalc = (now - playerData.lastCalc)/60000;

        const player = <Player>{
            id: playerData.id,
            level: playerData.level,
            xp: playerData.xp,
            hp: this.updateResource(new PlayerResource(playerData.hp, level.hp_max, level.hp_rate), minutesSinceCalc),
            ap: this.updateResource(new PlayerResource(playerData.ap, level.ap_max, level.ap_rate), minutesSinceCalc),
            atk: { min: level.atk_min, max: level.atk_max },
            crit: { rate: level.crit_rate, multi: level.crit_mult },
            lastCalc: now,
            cards: playerData.cards.map(x => <PlayerCard>{ id: x.id, equipped: x.equipped }),
            buffs: playerData.buffs
        };

        this._applyCards(player);
        this._applyBuffs(player);

        return player;
    }

    public updatePlayer(data: Player) {
        const player = this.getPlayerData(data.id);
        
        if (player.xp !== data.xp) {
            
            player.xp = data.xp;
            player.level = this._gamedata.GetLevelForXp(player.xp);
        }

        player.hp = data.hp.curr;
        player.ap = data.ap.curr;
        player.lastCalc = data.lastCalc;
        player.cards = data.cards.map(x => { return { id: x.id, equipped: x.equipped }; });

        _players[player.id] = player;
    }

    private getPlayerData(id: string): PlayerData {
        if (!_players[id]) {

            _players[id] = {
                id: id,
                level: 1,
                xp: 0,
                hp: 1,
                ap: 1,
                lastCalc: 0,
                cards: [],
                buffs: []
            }
        }

        return _players[id];
    }

    private updateResource(resource: PlayerResource, minutes: number): PlayerResource {
        resource.curr = resource.curr + resource.rate * minutes;
        if (resource.curr > resource.max) {
            resource.curr = resource.max;
        }

        return resource;
    }

    private _applyCards(player: Player) {
        for (const card of player.cards) {
            if (card.equipped) {
                for(const attr of this._gamedata.GetCardData(card.id).attributes) {
                    for(const modifier of attr.modifiers) {
                        ModifierUpdater.applyPassiveMod(player, modifier);
                    }
                }
            }
        }
    }

    private _applyBuffs(player: Player) {
        var buffs = [...player.buffs];

        for (const buff of buffs) {
            ModifierUpdater.applyBuff(player, buff);
        }
    }
}

export class Player {
    id: string;
    level: number;
    xp: number;
    atk: RangedStat;
    hp: PlayerResource;
    ap: PlayerResource;
    crit: CriticalRate;
    lastCalc: number;
    cards: PlayerCard[];
    buffs: Buff[];
}

export class PlayerCard {
    id: string;
    equipped: boolean;
}

export class CriticalRate {
    rate: number;
    multi: number;
}

export class PlayerResource {

    public max: number;
    public curr: number;
    public rate: number;

    constructor(curr: number, max: number, rate: number) {
        this.curr = curr;
        this.max = max;
        this.rate = rate;
    }

    public get(): number {
        return Math.floor(this.curr);
    }
}

export class RangedStat {
    min: number;
    max: number;
}

export class Buff {
    status: string;
    startDate: number;
}

class PlayerData {
    id: string;
    level: number;
    xp: number;
    hp: number;
    ap: number;
    lastCalc: number;
    cards: { id: string; equipped: boolean }[];
    buffs: Buff[];
}
