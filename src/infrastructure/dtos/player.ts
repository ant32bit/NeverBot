
export interface IPlayer {
    id: string;
    level: number;
    xp: number;
    atk: RangedStat;
    hp: PlayerResource;
    ap: PlayerResource;
    crit: CriticalRate;
    lastCalc: number;
    buffs: Buff[];
}

export class CriticalRate {
    rate: number;
    mult: number;
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
    emoji: string;
    startDate: number;
    modifiers: Modifier[];
}

export class Modifier {
    name: string;
    mod: string;
    min?: number;
    max?: number;
    percentage?: number;
    duration?: number;
    frequency?: number;
}