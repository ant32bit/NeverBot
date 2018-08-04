import { Message } from "discord.js";
import * as ConfigProvider from './config';

export abstract class Guards {

    private static adminServer = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json').adminServer;
    private static authenticatedUsers: string[] = null;

    public static AuthenticateOwner(msg: Message): boolean {
        if (this.authenticatedUsers == null) {
            const guild = msg.client.guilds.get(this.adminServer);
            this.authenticatedUsers = guild
                .members
                .filter(x => !x.user.bot)
                .map(x => x.user.id);
        }

        return this.authenticatedUsers.indexOf(msg.author.id) >= 0;
    }
}