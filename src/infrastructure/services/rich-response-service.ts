import { RichEmbed, TextChannel, DMChannel, GroupDMChannel, Message } from "discord.js";
import { ConfigService } from "./config-service";


export enum RichResponseType {
    Error = 0xf44542,
    Warning = 0xe8cb29,
    Question = 0xdb7420,
    OK = 0xb2e829,
    Transaction = 0x0bd6e5,
    
    Purple = 0x8956bc,
    Pink = 0xd151c2,

    Yellow = 0xc9a30c,

    Blue_Darkest = 0x0848af, 
    Blue_Dark = 0x2362c6, 
    Blue = 0x427edd, 
    Blue_Light = 0x6093e5
}

const prefix = ConfigService.GetGlobalConfig().prefix;

export abstract class RichResponseService {

    public static CreateMessage(type: RichResponseType, text?: string): RichEmbed {
        const m = new RichEmbed()
            .setColor(type);

        if (text && text.length > 0) {
            text.replace('{prefix}', prefix);
            m.setDescription(text);
        }

        return m;
    }

    public static SendMessage(to: TextChannel | DMChannel | GroupDMChannel, type: RichResponseType, text: string): Promise<Message> {
        return <Promise<Message>>to.send(RichResponseService.CreateMessage(type, text));
    }
}