import { CommandRouterService } from "../../infrastructure/command-router";
import { GameEngine, AttackFailReason } from "./gameengine";
import { MessageService } from "../../infrastructure/services";
import { PlayerRepository } from "../../infrastructure/repositories";
import { RichResponseService, RichResponseType } from "../../infrastructure/services/rich-response-service";
import { BattleMessages } from "./messages";


export abstract class BattleRoutes {
    public static RegisterRoutes(router: CommandRouterService) {
        
        const _playerRepo = new PlayerRepository();
        const _gameEngine = new GameEngine();
        const _messages = new BattleMessages();

        const _attackSyntax = "Syntax: {prefix}attack <member>";
        const _statusSyntax = "Syntax: {prefix}status [<member>]";
        
        router.RegisterRoute('attack', (c, m) => {
            

            if (c.args.length !== 1) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, _attackSyntax);
                return;
            }
            
            const victimId = MessageService.GetIdFromMention(c.args[0]);
            if (!victimId) { 
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, _attackSyntax);
                return;
            }

            const victim = m.mentions.users.get(victimId);
            if (!victim) { 
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, _attackSyntax);
                return;
            }

            const assailant = m.author;

            if (assailant.id === victim.id) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, "You cannot attack yourself")
                return;
            }

            _playerRepo.get(victimId, victimPlayer => {

                _playerRepo.get(assailant.id, assailantPlayer => {

                    const result = _gameEngine.Attack(assailantPlayer, victimPlayer);

                    if (result.success) {
                        _playerRepo.update(victimPlayer);
                        _playerRepo.update(assailantPlayer);
                    }

                    m.channel.send(_messages.AttackResult(assailant.username, victim.username, result));
                });
            });
        });

        router.RegisterRoute('status', (c, m) => {
            let user = m.author;

            if (c.args.length === 1) { 
                const userId = MessageService.GetIdFromMention(c.args[0]);
                if (!userId) { 
                    RichResponseService.SendMessage(m.channel, RichResponseType.Error, _statusSyntax);
                    return;
                }

                user = m.mentions.users.get(userId);
            }
            else if (c.args.length !== 0) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, _statusSyntax);
                return;
            }

            if (!user) { 
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, _statusSyntax);
                return;
            }

            _playerRepo.get(user.id, player => {
                m.channel.send(_messages.Status(user.username, player));
            });
        });
    }
}
