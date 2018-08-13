import { Message, Snowflake } from "discord.js";

export abstract class MessageService {
    
    public static GetIdFromMention(mention: string): string {
        const match = /^<@!?(\d+)>$/.exec(mention);
        return match ? match[1] : null;
    }
}