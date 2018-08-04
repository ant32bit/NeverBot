import { CommandRouterService } from "../../infrastructure/command-router";
import { Message } from "discord.js";
import { BankMessages } from "./messages";
import { BankAccount, BankRepository } from "./bank-repo";
import * as ConfigProvider from '../../infrastructure/config';
import { MentionHelper } from "../../infrastructure/mention-helper";
import { Guards } from "../../infrastructure/guards";

const _message = new BankMessages();
const _bank = new BankRepository();
const _dailyAmount = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json').allowance;;

export abstract class BankRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterRoute('money', (c, m) => {
            if (c.args.length === 0) {
                _bank.get(m.author.id, acc => {
                    m.channel.send(_message.AccountDetails(m.author.username, acc));
                });
            }
        });

        router.RegisterRoute('apply', (c, m) => {
            
            if (!Guards.AuthenticateOwner(m)) {
                return;
            }

            let amount: number = null;
            if (c.args.length === 2) {
                
                const applicantId = MentionHelper.GetIdFromMention(c.args[0]);
                const applicant = applicantId ? m.mentions.users.get(applicantId) : null;

                if (!applicant) {
                    return;
                }

                const amount = parseInt(c.args[1]);

                if (amount >= 0) {
                    _bank.get(applicantId, acc => {
                        acc.amount = amount;
                        _bank.update(acc, err => {
                            if (!err) {
                                m.channel.send(_message.Apply(applicant.username, amount));
                            }
                        })
                    });
                }
            }
        })

        router.RegisterRoute('daily', (c, m) => {
            var rn = Date.now();
            if (c.args.length == 0) {
                _bank.get(m.author.id, acc => {
                    if (this.isDailyAvailable(acc, new Date(rn))) {
                        acc.amount += _dailyAmount;
                        acc.dailyStreak++;
                        acc.lastDaily = rn;
                        _bank.update(acc, err => {
                            if (!err) {
                                m.channel.send(_message.Daily(m.author.username, _dailyAmount));
                            }
                        })
                    }
                    else {
                        m.channel.send(_message.DailyUnavailable(m.author.username));
                    }
                });
            }
        });
    }

    private static isDailyAvailable(acc: BankAccount, rn: Date): boolean {
        const ld = new Date(acc.lastDaily);

        if (rn.getUTCFullYear() > ld.getUTCFullYear() ||
            rn.getUTCMonth() > ld.getUTCMonth() ||
            rn.getUTCDate() > ld.getUTCDate()) {
            return true;
        }

        return false;
    }
}


