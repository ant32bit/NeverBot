import { IPlayer } from "../../infrastructure/dtos";


export class GameEngine {

    public Attack(assailant: IPlayer, victim: IPlayer): AttackResult {

        const apCost = 1;
        const xpGain = 1;

        const result: AttackResult = {
            assailaint: assailant,
            victim: victim,
            success: false,
            apCost: 0,
            xpGain: 0
        };

        if (assailant.hp.curr === 0 || assailant.buffs.findIndex(x => x.status === 'dead') >= 0) {
            result.failReason = AttackFailReason.PLAYER_ALREADY_DEAD;
            return result;
        }

        if (assailant.ap.curr < result.apCost) {
            result.failReason = AttackFailReason.NOT_ENOUGH_AP;
            result.apCost = apCost;
            return result;
        }

        if (victim.hp.curr === 0 || victim.buffs.findIndex(x => x.status === 'dead') >= 0) {
            result.failReason = AttackFailReason.VICTIM_ALREADY_DEAD;
            return result;
        }

        let dmg = Math.random() * (assailant.atk.max - assailant.atk.min) + assailant.atk.min;
        if (assailant.crit.rate > Math.random()) {
            result.critical = true;
            dmg *= assailant.crit.mult;
        }

        dmg = Math.round(dmg);

        result.damage = dmg;

        victim.hp.curr -= dmg;
        if (victim.hp.curr <= 0) {
            result.dead = true;
            victim.buffs = [{ status: 'dead', icon: '☠️', startDate: Date.now(), modifiers: []}];
            victim.hp.curr = 0;
        }

        assailant.ap.curr -= apCost;
        result.apCost = apCost;

        assailant.xp += xpGain;
        result.xpGain = xpGain;

        result.success = true;

        return result;
    }
}

export enum AttackFailReason {
    NOT_ENOUGH_AP,
    VICTIM_ALREADY_DEAD,
    PLAYER_ALREADY_DEAD
}

export class AttackResult {
    assailaint: IPlayer;
    victim: IPlayer;
    success: boolean;
    apCost: number;
    xpGain: number;
    damage?: number;
    critical?: boolean;
    dead?: boolean;
    failReason?: AttackFailReason;
}