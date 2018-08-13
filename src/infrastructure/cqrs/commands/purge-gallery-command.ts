import { ICommand } from "../command-dispatcher";
import { TextChannel, Snowflake, Message, SnowflakeUtil } from "discord.js";

export class PurgeGalleryCommand implements ICommand {
    
    private static interval = 500;

    constructor (private _invokeMessage: Message) {}

    public run() {
       this.runFrom(this._invokeMessage);
    }

    private runFrom(message: Message) {

        this._invokeMessage.channel.fetchMessages({ before: message.id })
            .then(c => {
                
                if (!c || c.size == 0) {
                    return;
                }

                let earliestImage: Message = message;
                let interval = PurgeGalleryCommand.interval;
                let changed = false;
                c.forEach(m => {
                    if (m.attachments && m.attachments.size > 0) {
                        if (m.createdTimestamp < earliestImage.createdTimestamp) {
                            earliestImage = m;
                            changed = true;
                        }
                    }
                    else {
                        m.delete(interval).catch(o => console.log(o));
                        interval += PurgeGalleryCommand.interval;
                    }
                })

                if (!changed) {
                    interval = 50 * PurgeGalleryCommand.interval;
                }
                
                console.log(`interval: ${interval}ms, ${c.size} messages`);
                setTimeout(() => { this.runFrom(earliestImage); }, interval);
            })
            .catch(o => {
                console.log(o);
            })
    }
}