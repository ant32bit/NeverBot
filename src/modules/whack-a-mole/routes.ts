import { CommandRouterService } from "../../infrastructure/command-router";
import { WhackamoleEngine } from "./whackamole";
import { WhackamoleMessages } from "./messages";

const _messages = new WhackamoleMessages();

export abstract class WhackamoleRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterRoute('whack', (c, m) => {

            const engine = new WhackamoleEngine(3);
            const whacks = engine.ParseWhacks(c.args.join(''));

            if (!whacks) {
                m.channel.send(_messages.Syntax());
                return;
            }
            
            const moles = engine.GenerateMoles();

            m.channel.send(_messages.Results(moles, whacks));
        });

        
    }
}