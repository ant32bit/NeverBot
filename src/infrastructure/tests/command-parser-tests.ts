import { CommandParser } from "../command-parser";
import { CommandRouterService } from "../command-router";
import { NeverRoutes } from "../../modules/never/routes";
import { WhackamoleRoutes } from "../../modules/whack-a-mole/routes";

export function test() {
    const router = new CommandRouterService();
    NeverRoutes.RegisterRoutes(router);
    WhackamoleRoutes.RegisterRoutes(router);

    const parser = new CommandParser(router);

    for (let msg of ["n$new", 'N$new', 'N$new ', 'n$new 10']) {
        console.log(`parse "${msg}"`, parser.Parse(msg));
    }
};