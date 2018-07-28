import { CommandRouterService } from "../../infrastructure/command-router";
import { PlayersRepo } from "./players";
import { GameEngine } from "./gameengine";
import { MentionHelper } from "../../infrastructure/mention-helper";

export abstract class BattleRoutes {
    public static RegisterRoutes(router: CommandRouterService) {
        
        const _playerRepo = new PlayersRepo();
        const _gameEngine = new GameEngine();
        
        router.RegisterRoute('attack', (c, m) => {
            if (c.args.length !== 1) { return; }
            
            const victimId = MentionHelper.GetIdFromMention(c.args[0]);
            if (!victimId) { return; }

            const victim = m.mentions.users.get(victimId);
            if (!victim) { return; }

            const assailant = m.author;

            if (assailant.id === victim.id) {
                m.channel.send("You cannot attack yourself!");
                return;
            }

            const victimPlayer = _playerRepo.getPlayer(victimId);
            const assailantPlayer = _playerRepo.getPlayer(assailant.id);

            const result = _gameEngine.Attack(assailantPlayer, victimPlayer);

            if (result.success) {
                _playerRepo.updatePlayer(victimPlayer);
                _playerRepo.updatePlayer(assailantPlayer);

                let message = `**${assailant.username}** used ${result.apCost} AP to attack **${victim.username}**`;

                if (result.critical) {
                    message += `\nCRITICAL HIT! ${victim.username} was hit for ${result.damage} HP.`;
                }
                else {
                    message += `\n${victim.username} was hit for ${result.damage} HP.`;
                }

                if (result.dead) {
                    message += `\n${victim.username} is dead.`;
                }
                else {
                    message += `\n${victim.username} has ${victimPlayer.hp.get()} HP left`;
                }

                message += `\n${assailant.username} has ${assailantPlayer.ap.get()} AP left`;
                message += `\n${assailant.username} gained ${result.xpGain} XP`;

                m.channel.send(message);
            }
            else {
                if (result.failReason === "NOT_ENOUGH_AP") {
                    m.channel.send(`${assailant.username} does not have enough AP to attack.`);
                }
                else if (result.failReason === "VICTIM_ALREADY_DEAD") {
                    m.channel.send(`${victim.username} is already dead!`);
                }
                else if (result.failReason === "PLAYER_ALREADY_DEAD") {
                    m.channel.send(`${assailant.username} cannot attack while dead!`);
                }
            }
        });

        router.RegisterRoute('status', (c, m) => {
            let user = m.author;

            if (c.args.length === 1) { 
                const userId = MentionHelper.GetIdFromMention(c.args[0]);
                if (!userId) { return; }

                user = m.mentions.users.get(userId);
            }
            else if (c.args.length !== 0) {
                return;
            }

            if (!user) { return; }

            const player = _playerRepo.getPlayer(user.id);

            let message = `**${user.username}**'s stats\n\n`;

            message += `Level ${player.level} (${player.xp} XP)\n\n`

            message += `Atk: ${player.atk.min} - ${player.atk.max}\n`;
            message += `(${player.crit.rate * 100}% chance for ${player.crit.multi}x dmg)\n\n`

            message += `HP: ${player.hp.get()}/${player.hp.max} (${player.hp.rate}/min)\n`;
            message += `AP: ${player.ap.get()}/${player.ap.max} (${player.ap.rate}/min)`;

            m.channel.send(message);
        });
    }
}
