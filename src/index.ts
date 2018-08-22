import { Client } from 'discord.js';
import { CommandRouterService } from './infrastructure/command-router';
import { ConfigService } from './infrastructure/services';
import { NeverRoutes } from './modules/never/routes';
import { WhackamoleRoutes } from './modules/whack-a-mole/routes';
import { ConverterRoutes } from './modules/convert/routes';
import { BattleRoutes } from './modules/battle/routes';
import { AdminRoutes } from './modules/admin/routes';
import { BankRoutes } from './modules/bank/routes';
import { CasinoRoutes } from './modules/casino/routes';
import { ShopRoutes } from './modules/shop/routes';
import { ItemRoutes } from './modules/items/routes';
import { SayRoutes } from './modules/say/routes';

const config = ConfigService.GetGlobalConfig();
const client = new Client();
const router = new CommandRouterService();
NeverRoutes.RegisterRoutes(router);
WhackamoleRoutes.RegisterRoutes(router);
ConverterRoutes.RegisterRoutes(router);
BankRoutes.RegisterRoutes(router);
CasinoRoutes.RegisterRoutes(router);
BattleRoutes.RegisterRoutes(router);
AdminRoutes.RegisterRoutes(router);
ShopRoutes.RegisterRoutes(router);
ItemRoutes.RegisterRoutes(router);
SayRoutes.RegisterRoutes(router);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    router.Evaluate(msg);
});

client.login(config.token);
