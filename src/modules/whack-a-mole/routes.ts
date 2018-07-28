import { CommandRouterService } from "../../infrastructure/command-router";
import { Whackamole } from "./whackamole";

export abstract class WhackamoleRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        router.RegisterRoute('whack', (c, m) => {
            m.channel.send(new Whackamole(c.args.join('')).Result);
        });
    }
}