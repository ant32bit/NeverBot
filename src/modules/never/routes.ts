import { CommandRouterService } from "../../infrastructure/command-router";
import { NeverHaveIEverServer } from "./never";
import { Message } from "discord.js";
import { NeverMessages } from "./messages";

const _messages = new NeverMessages();

export abstract class NeverRoutes {

    public static servers: {[name: string]: NeverHaveIEverServer} = {};

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterSubroute('never', 'new', (c, m) => {
            const serverId = m.channel.id;
            this.servers[serverId] = new NeverHaveIEverServer(serverId);
            const state = this.servers[serverId].GetState();
            m.channel.send(_messages.Question(state));
        });

        router.RegisterSubroute('never', 'next', (c, m) => {
            const serverId = m.channel.id;
            if (!this.servers[serverId]) {
                this.servers[serverId] = new NeverHaveIEverServer(serverId);
            }
            else {
                this.servers[serverId].Next();
            }

            const state = this.servers[serverId].GetState();
            m.channel.send(_messages.Question(state));
        });

        router.RegisterSubroute('never', 'tally', (c, m) => {
            const serverId = m.channel.id;
            if (this.servers[serverId]) {
                const state = this.servers[serverId].GetState();
                m.channel.send(_messages.Tally(state));
            }
            else {
                m.channel.send(_messages.NoGame());
            }
        });

        router.RegisterOptionsRoutes(['i have'], (o, m) => {
            const serverId = m.channel.id;
            if (!this.servers[serverId]) {
                return;
            }

            this.servers[serverId].Confess(m.author);
            m.channel.send(_messages.OnConfession(m.author.username))
                .then(msg => (<Message>msg).delete(1000));
        });
    }
}