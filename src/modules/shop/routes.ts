import { CommandRouterService } from "../../infrastructure/command-router";
import { ShopService } from "../../infrastructure/services/shop-service";
import { RichResponseService, RichResponseType } from "../../infrastructure/services/rich-response-service";
import { ConfigService } from "../../infrastructure/services";
import { ItemService } from "../../infrastructure/services/item-service";
import { InventoryRepository, BankRepository } from "../../infrastructure/repositories";

const _currency = ConfigService.GetGlobalConfig().currency;

export abstract class ShopRoutes {
    public static RegisterRoutes(router: CommandRouterService) {
        
        const invRepo = new InventoryRepository();
        const bankRepo = new BankRepository();
        
        router.RegisterRoute('shop', (c, m) => {
            
            if (c.args.length != 1) {
                const syntax = RichResponseService.CreateMessage(RichResponseType.Error, "Syntax: {prefix}shop <shop name>");

                ShopService.Shops().forEach(x => {
                    syntax.addField(x.id, x.name);
                });

                m.channel.send(syntax);
                return;
            }

            const shop = ShopService.Shop(c.args[0]);

            if (shop) {
                const shopInfo = RichResponseService.CreateMessage(RichResponseType.Yellow, `${shop.id} - ${shop.name}`);
                shop.items.forEach(x => {
                    const itemField = ItemService.field(x.item);
                    shopInfo.addField(`${itemField.name} (${_currency}${x.price})`, `${itemField.value}\n`);
                });

                m.channel.send(shopInfo);
                return;
            }

            const item = ItemService.get(c.args[0]);

            if (item) {
                const shops = ShopService.Item(item.name);
                const itemField = ItemService.field(item.name);

                const itemInfo = RichResponseService.CreateMessage(RichResponseType.Yellow);
                itemInfo.addField(itemField.name, itemField.value);
                itemInfo.addBlankField();

                if (shops.length > 0) {
                    itemInfo.addField('Available from:', shops.map(s => `${s.shop} (${_currency}${s.price})`).join('\n'));
                }
                else {
                    itemInfo.addField("Not For Sale!", "This item cannot be bought in shops");
                }

                m.channel.send(itemInfo);
                return;
            }
        });

        router.RegisterRoute('buy', (c, m) => {
            if (c.args.length != 1) {
                const syntax = RichResponseService.CreateMessage(RichResponseType.Error, "Syntax: {prefix}buy <item name>");

                m.channel.send(syntax);
                return;
            }

            const item = ItemService.get(c.args[0]);

            if (item) {
                const shops = ShopService.Item(item.name);

                if (shops.length < 1) {
                    RichResponseService.SendMessage(m.channel, RichResponseType.Error, `${item.name} is not available for purchase`);
                    return;
                }

                let name = shops[0].shop;
                let price = shops[0].price;

                for (let shop of shops) {
                    if (shop.price < price) {
                        name = shop.shop;
                        price = shop.price;
                    }
                }

                const user = m.author.id;

                bankRepo.get(user, a => {
                    if (price <= a.amount) {
                        a.amount -= price;
                        bankRepo.update(a);
                    }

                    invRepo.add(user, item.name, 1);
                });

                RichResponseService.SendMessage(m.channel, RichResponseType.Transaction, `**${m.author.username}** bought ${item.icon} for ${_currency}${price}`);
                return;
            }
            else {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, `${item.name} is not a thing`)
                return;
            }
        });
    }
}
