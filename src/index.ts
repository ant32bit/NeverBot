import { Client } from 'discord.js';
import { CommandRouterService } from './infrastructure/command-router';
import * as ConfigProvider from './infrastructure/config';
import { NeverRoutes } from './modules/never/routes';
import { WhackamoleRoutes } from './modules/whack-a-mole/routes';
import { ConverterRoutes } from './modules/convert/routes';
import { BattleRoutes } from './modules/battle/battle/routes';
import { CardRoutes } from './modules/battle/cards/routes';
import { AdminRoutes } from './modules/admin/routes';

const config = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json');
const client = new Client();
const router = new CommandRouterService();
NeverRoutes.RegisterRoutes(router);
WhackamoleRoutes.RegisterRoutes(router);
ConverterRoutes.RegisterRoutes(router);
//BattleRoutes.RegisterRoutes(router);
//CardRoutes.RegisterRoutes(router);
AdminRoutes.RegisterRoutes(router);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    router.Evaluate(msg);
});

client.login(config.token);
