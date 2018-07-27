import { Player, Buff } from "./players";
import { Modifier, GameDataRepo } from "./gamedata";

const passiveMods: {[mod: string]: (p: Player, m: Modifier) => void} = {
    "atkmod": (p, m) => {
        if (m.min != null && m.max != null) {
            p.atk.min += m.min;
            p.atk.max += m.max;
        }
    }
}

const buffs: {[mod: string]: (p: Player, b: Buff, m: Modifier) => void} = {
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

const _gameData = new GameDataRepo();

export function applyPassiveMod(p: Player, m: string) {
    const modifier = _gameData.GetModifier(m);
    if (!modifier) { return; }
    if (!passiveMods[modifier.name]) { return }

    passiveMods[modifier.name](p, modifier);
}

export function applyBuff(p: Player, b: Buff) {
    const modifier = _gameData.GetModifier(b.status);
    if (!modifier) { return; }
    if (!buffs[modifier.name]) { return }

    buffs[modifier.name](p, b, modifier);
}

abstract class ModifierHelper {
    public static calculateEffectiveTime(p: Player, b: Buff, m: Modifier) {
        const elapsedTime = p.lastCalc - b.startDate;
        if (m.duration) {
            
        }
    }
}