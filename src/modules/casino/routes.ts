import { CommandRouterService } from "../../infrastructure/command-router";
import { Message, RichEmbed } from "discord.js";
import { CasinoMessages } from "./messages";
import { CasinoEngine, CasinoSettings } from "./casino";
import { BankRepository } from "../bank/bank-repo";
import { CasinoStats } from "./casino-stats";
import * as ConfigProvider from '../../infrastructure/config';

const _settings = ConfigProvider.GetConfig<CasinoSettings>('casino.json');
const _message = new CasinoMessages();
const _casino = new CasinoEngine();
const _stats = new CasinoStats();
const _bank = new BankRepository();

export abstract class CasinoRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterSubroute('slots', 'e', (c, m) => {
            return m.channel.send(new RichEmbed().setColor(0xa59c8b).setDescription(`E(*x*) = ${_stats.E}`));
        });

        router.RegisterSubroute('slots', 'p', (c, m) => {
            return m.channel.send(new RichEmbed().setColor(0xa59c8b).setDescription(_stats.M));
        });

        router.RegisterRoute('slots', (c, m) => {
            if (c.args.length !== 1) {
                m.channel.send(_message.Syntax(c.command));
                return;
            }

            const bet = parseInt(c.args[0]);

            if (bet < _settings.bet.min) {
                m.channel.send(_message.BetTooLow(m.author.username, _settings.bet.min))
                    .then(msg => (<Message>msg).delete(5000));
                return;
            }
            else if (bet > _settings.bet.max) {
                m.channel.send(_message.BetTooHigh(m.author.username, _settings.bet.max))
                    .then(msg => (<Message>msg).delete(5000));
                return;
            }
            else if (bet >= 1) {
                _bank.get(m.author.id, acc => {
                    if (acc.amount < bet) {
                        m.channel.send(_message.NotEnoughMoney(m.author.username));
                        return;
                    }

                    const cd = _casino.getCooldown(m.author.id);
                    if (cd > 0) {
                        m.channel.send(_message.Cooldown(m.author.username, cd))
                            .then(msg => (<Message>msg).delete(5000));
                        return;
                    }

                    const result = _casino.slots();
                    const winnings = bet * result.multiplier;

                    acc.amount += winnings - bet;

                    _bank.update(acc, err => {
                        if (!err) {
                            m.channel.send(_message.SlotResult(m.author.username, bet, winnings, result));
                        }
                    })
                });
            }
            else {
                m.channel.send(_message.Syntax(c.command));
            }
        });
    }
}


