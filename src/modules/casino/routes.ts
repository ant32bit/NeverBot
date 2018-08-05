import { CommandRouterService } from "../../infrastructure/command-router";
import { Message, RichEmbed } from "discord.js";
import { CasinoMessages } from "./messages";
import { CasinoEngine } from "./casino";
import { BankRepository } from "../bank/bank-repo";
import { CasinoStats } from "./casino-stats";

const _message = new CasinoMessages();
const _casino = new CasinoEngine();
const _stats = new CasinoStats();
const _bank = new BankRepository();

export abstract class CasinoRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterSubroute('slots', 'e', (c, m) => {
            return m.channel.send(new RichEmbed().setColor(0xa59c8b).setDescription(`E(*x*) = ${_stats.E}`));
        });

        router.RegisterRoute('slots', (c, m) => {
            if (c.args.length !== 1) {
                m.channel.send(_message.Syntax(c.command));
                return;
            }

            const bet = parseInt(c.args[0]);

            if (bet >= 1) {
                _bank.get(m.author.id, acc => {
                    if (acc.amount < bet) {
                        m.channel.send(_message.NotEnoughMoney(m.author.username));
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


