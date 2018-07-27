import { CommandRouterService } from "../../infrastructure/command-router";
import { NeverHaveIEverServer } from "./never";
import { Message } from "discord.js";

export abstract class NeverRoutes {

    public static servers: {[name: string]: NeverHaveIEverServer} = {};

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterRoute('n$new', (c, m) => {
            const serverId = m.channel.id;
            this.servers[serverId] = new NeverHaveIEverServer(serverId);
            const score = this.servers[serverId].GetScore();

            m.channel.send(`${score.question}\n\nIf *you* have, type \"I have\"`);
        });

        router.RegisterRoute('n$next', (c, m) => {
            const serverId = m.channel.id;
            if (!this.servers[serverId]) {
                this.servers[serverId] = new NeverHaveIEverServer(serverId);
            }
            else {
                this.servers[serverId].Next();
            }

            const score = this.servers[serverId].GetScore();
            m.channel.send(`${score.question}\n\nIf *you* have, type \"I have\"`);
        });

        router.RegisterRoute('n$tally', (c, m) => {
            const serverId = m.channel.id;
            if (this.servers[serverId]) {
                const score = this.servers[serverId].GetScore();

                const tallyText = score.scores.map(x => `${x.name} - ${x.score}`).join('\n');
                m.channel.send(`Here are the scores\n\n${tallyText}`);
            }
            else {
                m.channel.send('Never Have I Ever has not started. To start a game, type `n$new`');
            }
        });

        router.RegisterOptionsRoutes(['i have'], (o, m) => {
            const serverId = m.channel.id;
            if (!this.servers[serverId]) {
                return;
            }

            this.servers[serverId].Confess(m.author);
            m.channel.send(`${m.author.username} has!`).then(msg => (<Message>msg).delete(1000));
        });
    }
}