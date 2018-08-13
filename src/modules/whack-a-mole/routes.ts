import { CommandRouterService } from "../../infrastructure/command-router";
import { WhackamoleEngine } from "./whackamole";
import { RichResponseService, RichResponseType } from "../../infrastructure/services/rich-response-service";

export abstract class WhackamoleRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterRoute('whack', (c, m) => {

            const engine = new WhackamoleEngine(3);
            const whacks = engine.ParseWhacks(c.args.join(''));

            if (!whacks) {

                RichResponseService.SendMessage(
                    m.channel, 
                    RichResponseType.Error, 
                    'syntax: {prefix}whack <1-9> <1-9> <1-9>');
                return;
            }
            
            const moles = engine.GenerateMoles();

            m.channel.send(engine.Result(moles, whacks));
        });

        
    }
}