import { Client } from 'discord.js';
import { NeverHaveIEverServer } from './never/never';
import { Whackamole } from './never/whackamole';

const client = new Client();

const servers: {[name: string]: NeverHaveIEverServer} = {};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const lowerContent = msg.content.toLowerCase();
    const serverId = msg.channel.id;
    
    const matches = /^n\$whack(.*)$/.exec(lowerContent);
    if (!matches && !servers.hasOwnProperty(serverId)) {
        servers[serverId] = new NeverHaveIEverServer(serverId);
    }

    if (matches) { 
        console.log(`whack! ${matches[1]}`);
        const whack = new Whackamole(matches[1]);
        msg.reply(whack.Result); 
    }
    else if (/^n\$new(?:\s|$)/.test(lowerContent)) { 
        servers[serverId] = new NeverHaveIEverServer(serverId);
        const score = servers[serverId].GetScore();

        msg.reply(`I've created a new Never Have I Ever Game\n\n${score.question}\n\nif *you* have, type \"I have\"`);
    }
    else if (/^n\$next(?:\s|$)/.test(lowerContent)) {
        servers[serverId].Next();
        const score = servers[serverId].GetScore();

        msg.reply(`you asked a new Question\n\n${score.question}\n\nif *you* have, type \"I have\"`);
    }
    else if (/^n\$tally(?:\s|$)/.test(lowerContent)) {
        const score = servers[serverId].GetScore();
        const tallyText = score.scores.map(x => `${x.name} - ${x.score}`).join('\n');
        msg.reply(`here are the scores\n${tallyText}`);
    }
    else if (lowerContent.trim() === 'i have') {
        servers[serverId].Confess(msg.author);
        //msg.reply('you have?');
    }

//if (msg.content === 'ping') {
//    msg.reply('Pong!');
//}
});

client.login('token');