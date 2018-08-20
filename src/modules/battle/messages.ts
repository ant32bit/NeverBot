import { RichEmbed, Guild } from "discord.js";
import { ConfigService } from "../../infrastructure/services";
import { AttackResult, AttackFailReason } from "./gameengine";
import { RichResponseService, RichResponseType } from "../../infrastructure/services/rich-response-service";
import { IPlayer } from "../../infrastructure/dtos";

export class BattleMessages {

    public AttackResult(assailantName: string, victimName: string, attackResult: AttackResult): RichEmbed {

        if (attackResult.success) {
            const message = RichResponseService.CreateMessage(RichResponseType.OK, `**${assailantName}** used ${attackResult.apCost} AP to attack **${victimName}**`);
        
            const hit = (attackResult.critical ? "**CRITICAL HIT!** " : "") + `${victimName} was hit for ${attackResult.damage} HP.`;

            var flowOnEffects = attackResult.dead ? `${victimName} is dead.` : `${victimName} has ${attackResult.victim.hp.get()} HP left.`
            flowOnEffects += `\n${assailantName} has ${attackResult.assailaint.ap.get()} AP left`;
            flowOnEffects += `\n${assailantName} gained ${attackResult.xpGain} XP`;

            message.addField(hit, flowOnEffects);
            return message;
        }
        else {
            if (attackResult.failReason === AttackFailReason.NOT_ENOUGH_AP) {
                return RichResponseService.CreateMessage(RichResponseType.Error, `${assailantName} does not have enough AP to attack.`);
            }
            else if (attackResult.failReason === AttackFailReason.VICTIM_ALREADY_DEAD) {
                return RichResponseService.CreateMessage(RichResponseType.Error, `${victimName} is already dead!`);
            }
            else if (attackResult.failReason === AttackFailReason.PLAYER_ALREADY_DEAD) {
                return RichResponseService.CreateMessage(RichResponseType.Error, `${assailantName} cannot attack while dead!`);
            }
            else {
                return RichResponseService.CreateMessage(RichResponseType.Error, "There was an unknown error with this attack");
            }
        }
    }

    public Status(playerName: string, player: IPlayer) {
        const message = RichResponseService.CreateMessage(RichResponseType.OK, `**${playerName}**'s stats\n\n`);

        message.addField(null, `Level ${player.level} (${player.xp} XP)`);

        message.addField("Damage", `Atk: ${player.atk.min} - ${player.atk.max}\n(${player.crit.rate * 100}% chance for ${player.crit.mult}x dmg)`);

        message.addField("Stamina", `HP: ${player.hp.get()}/${player.hp.max} (${player.hp.rate}/min)\nAP: ${player.ap.get()}/${player.ap.max} (${player.ap.rate}/min)`);

        return message;
    }
}