import { CommandRouterService } from "../../infrastructure/command-router";
import { ConfigService, GuardsService, MessageService, RichResponseService, RichResponseType, ItemService } from "../../infrastructure/services";
import { BankRepository, InventoryActionStatus, InventoryRepository } from "../../infrastructure/repositories";
import { IBankAccount } from "../../infrastructure/dtos";
import { TranslationLogRepository } from "../../infrastructure/repositories/translation-log-repo";

const _bankRepo = new BankRepository();
const _invRepo = new InventoryRepository();
const _transalationLogs = new TranslationLogRepository();
const _currency = ConfigService.GetGlobalConfig().currency;

export abstract class SudoRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterSubroute('sudo', 'give', (c, m) => {


            if (!GuardsService.AuthenticateOwner(m)) {
                return;
            }

            if (c.args.length != 2) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, "Syntax: {prefix}sudo give <item name|amount> <member>");
                return;
            }

            const item = ItemService.get(c.args[0]);
            const amount = parseInt(c.args[0]);
            const receiverId = MessageService.GetIdFromMention(c.args[1]);

            if (receiverId == null || (item == null && isNaN(amount))) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, "Syntax: {prefix}sudo give <item name|amount> <member>");
                return;
            }

            const guild = m.guild;
            if (!guild) {return;}

            const receiver = guild.members.get(receiverId).user;

            if (item != null) {
                _invRepo.add(receiver.id, item.name, 1, giveErr => {
                    if (giveErr == InventoryActionStatus.SUCCESS) {
                        RichResponseService.SendMessage(m.channel, RichResponseType.Transaction, `Gave ${item.icon} to ${receiver.username}`);
                        return;
                    }
                });
            }
            else if (amount > 0) {
                _bankRepo.get(receiver.id, receiverAcc => {
                    receiverAcc.amount += amount;

                    _bankRepo.update(receiverAcc);

                    RichResponseService.SendMessage(m.channel, RichResponseType.Transaction, `Gave ${_currency}${amount} to ${receiver.username}`);
                    return;
                });
            }
        });

        router.RegisterSubroute('sudo', 'whosaid', (c, m) => {
            
            if (!GuardsService.AuthenticateOwner(m)) {
                return;
            }

            if (c.args.length === 0) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, "Syntax: {prefix}sudo whosaid <text>");
            } 

            const searchTerm = c.args.join(' ');

            _transalationLogs.find(m.guild.id, searchTerm, (err, logs) => {
                if (logs == null || logs.length === 0) {
                    RichResponseService.SendMessage(m.channel, RichResponseType.Warning, "No results found");
                    return;
                }
                else {
                    const results = RichResponseService.CreateMessage(RichResponseType.OK, "**Results**");

                    logs.forEach(x => {

                        const member = m.guild.members.get(x.user);
                        const user = member ? member.user.username : `Unknown (${x.user})`;

                        const title = `${user} (${new Date(x.date).toLocaleDateString('en-AU')}) wrote:`;
                        const data = x.output != null ? `input: ${x.input}\noutput: ${x.output}` : `output: ${x.input}`;
                        results.addField(title, data);
                    });

                    m.channel.send(results);
                    return;
                }
            })
        });
    }
}


