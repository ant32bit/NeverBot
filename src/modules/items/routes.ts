import { CommandRouterService } from "../../infrastructure/command-router";
import { ShopService } from "../../infrastructure/services/shop-service";
import { RichResponseService, RichResponseType } from "../../infrastructure/services/rich-response-service";
import { ConfigService, MessageService } from "../../infrastructure/services";
import { ItemService } from "../../infrastructure/services/item-service";
import { InventoryRepository, BankRepository, InventoryActionStatus } from "../../infrastructure/repositories";

const _currency = ConfigService.GetGlobalConfig().currency;

export abstract class ItemRoutes {
    public static RegisterRoutes(router: CommandRouterService) {
        
        const invRepo = new InventoryRepository();
        const bankRepo = new BankRepository();
        
        router.RegisterRoute('items', (c, m) => {
            
            invRepo.get(m.author.id, i => {
                const items = Object.keys(i);
                if (items.length === 0) {
                    RichResponseService.SendMessage(m.channel, RichResponseType.Yellow, `${m.author.username} hasn't got any items`)
                } 
                else {
                    RichResponseService.SendMessage(m.channel, RichResponseType.Yellow, `${m.author.username} has: ` + Object.keys(i).map(x => `${ItemService.get(x).icon}x${i[x]}`).join(' '));
                }
            });
        });

        router.RegisterRoute('give', (c, m) => {
            if (c.args.length != 2) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, "Syntax: {prefix}give <item name|amount> <member>");
                return;
            }

            const item = ItemService.get(c.args[0]);
            const amount = parseInt(c.args[0]);
            const receiverId = MessageService.GetIdFromMention(c.args[1]);
            const giver = m.author;

            if (receiverId == null || (item == null && isNaN(amount))) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, "Syntax: {prefix}give <item name|amount> <member>");
                return;
            }

            const guild = m.guild;
            if (!guild) {return;}

            const receiver = guild.members.get(receiverId).user;

            if (item != null) {
                invRepo.take(giver.id, item.name, 1, takeErr => {
                    if (takeErr == InventoryActionStatus.NOT_ENOUGH) {
                        RichResponseService.SendMessage(m.channel, RichResponseType.Error, `${giver.username} doesn't have any ${item.icon}`);
                        return;
                    }
                    else if (takeErr == InventoryActionStatus.SUCCESS) {
                        invRepo.add(receiver.id, item.name, 1, giveErr => {
                            if (giveErr == InventoryActionStatus.SUCCESS) {
                                RichResponseService.SendMessage(m.channel, RichResponseType.Transaction, `${giver.username} gave ${item.icon} to ${receiver.username}`);
                                return;
                            }
                        });
                    }
                });
            }
            else if (amount > 0) {
                bankRepo.get(giver.id, giverAcc => {
                    if (giverAcc.amount >= amount) {
                        bankRepo.get(receiver.id, receiverAcc => {
                            giverAcc.amount -= amount;
                            receiverAcc.amount += amount;

                            bankRepo.update(giverAcc);
                            bankRepo.update(receiverAcc);

                            RichResponseService.SendMessage(m.channel, RichResponseType.Transaction, `${giver.username} gave ${_currency}${amount} to ${receiver.username}`);
                            return;
                        });
                    }
                    else {
                        RichResponseService.SendMessage(m.channel, RichResponseType.Error, `${giver.username} doesn't have ${_currency}${amount}`);
                        return;
                    }
                });
            }
        });

        router.RegisterRoute
    }
}
