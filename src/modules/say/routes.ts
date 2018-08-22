import { CommandRouterService } from "../../infrastructure/command-router";
import { RichResponseType, RichResponseService } from "../../infrastructure/services/rich-response-service";
import { TranslationService } from "../../infrastructure/services/translation-service";
import { TranslationLogRepository } from "../../infrastructure/repositories/translation-log-repo";

const logs = new TranslationLogRepository();

export abstract class SayRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterRoute('say', (c, m) => {

            if (c.args.length == 0 || (c.args.length == 1 && c.args[0].startsWith('-'))) {
                RichResponseService.SendMessage(m.channel, RichResponseType.Error, "Syntax: {prefix}say [-<language>] <text>");
                return;
            }
            
            const channel = m.channel;
            const server = m.guild.id;
            const user = m.author.id;

            m.delete();

            if (c.args[0].startsWith('-')) {
                const target = c.args[0].substring(1);
                const text = c.args.slice(1).join(' ');

                TranslationService.Translate(text, target, (e, t) => {
                    if (e) {
                        console.log("Translation err", c, e);
                    }

                    logs.log(server, user, text, t.translatedText, [t.detectSourceLanguage, target].join(':'));
                    channel.send(t.translatedText);
                });
            }
            else {
                const text = c.args.join(' ');
                logs.log(server, user, text);
                channel.send(text);
            }
        });
    }
}