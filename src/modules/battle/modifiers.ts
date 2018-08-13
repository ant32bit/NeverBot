import { IPlayer, Modifier, Buff } from "../../infrastructure/dtos";


const passiveMods: {[mod: string]: (p: IPlayer, m: Modifier) => void} = {
    "atkmod": (p, m) => {
        if (m.min != null && m.max != null) {
            p.atk.min += m.min;
            p.atk.max += m.max;
        }
    }
}

const buffs: {[mod: string]: (p: IPlayer, b: Buff, m: Modifier) => void} = {
    "dead": (p, b, m) => {
        if (p.lastCalc - b.startDate >= 3600000) { // 1hr minute death
            p.buffs = [];
            p.hp.curr = p.hp.max;
            p.ap.curr = p.ap.max;
        }
        else {
            p.hp.curr = 0;
            p.ap.curr = 0;
        }
    },
    "bleeding": (p, b, m) => {

    }
}

export function applyBuff(p: IPlayer, b: Buff) {
    const modifier = b.modifiers[0];
    if (!modifier) { return; }
    if (!buffs[modifier.name]) { return }

    buffs[modifier.name](p, b, modifier);
}

abstract class ModifierHelper {
    public static calculateEffectiveTime(p: IPlayer, b: Buff, m: Modifier) {
        const elapsedTime = p.lastCalc - b.startDate;
        if (m.duration) {
            
        }
    }
}