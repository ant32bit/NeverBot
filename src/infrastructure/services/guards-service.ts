import { Message, TextChannel } from "discord.js";
import { ConfigService } from "./config-service";

export abstract class GuardsService {

    private static adminServer = ConfigService.GetGlobalConfig().adminServer;

    public static AuthenticateOwner(msg: Message): boolean {
        
        const guild = msg.client.guilds.get(this.adminServer);
        const owners = guild
            .members
            .filter(x => !x.user.bot)
            .map(x => x.user.id);

        return owners.indexOf(msg.author.id) >= 0;
    }

    public static AuthenticateChannelAdmin(msg: Message): boolean {
        const author = msg.guild.members.get(msg.author.id);
        const channel = msg.channel.type === "text" ? <TextChannel>msg.channel : null;
        return channel && author && channel.permissionsFor(author).hasPermission("MANAGE_CHANNELS");
    }
}