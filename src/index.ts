import { Client } from 'discord.js';
import { CommandRouterService } from './infrastructure/command-router';
import { NeverRoutes } from './modules/never/routes';
import { WhackamoleRoutes } from './modules/whack-a-mole/routes';
import { ConverterRoutes } from './modules/convert/routes';

const client = new Client();
const router = new CommandRouterService();
NeverRoutes.RegisterRoutes(router);
WhackamoleRoutes.RegisterRoutes(router);
ConverterRoutes.RegisterRoutes(router);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    router.Evaluate(msg);
});

client.login('token');
