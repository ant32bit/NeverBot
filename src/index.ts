import { Client } from 'discord.js';
import { CommandRouterService } from './infrastructure/command-router';
import { NeverRoutes } from './modules/never/routes';
import { WhackamoleRoutes } from './modules/whack-a-mole/routes';

const client = new Client();
const router = new CommandRouterService();
NeverRoutes.RegisterRoutes(router);
WhackamoleRoutes.RegisterRoutes(router);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    router.Evaluate(msg);
});

client.login('token');client.login('token');
