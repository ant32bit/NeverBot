import { Message } from "discord.js";
import { Command } from "./command";
import { CommandParser } from "./command-parser";


export class CommandRouterService {
    private _routes: {[command: string]: Route} = {};
    private _optionRoutes: {[option: string]: ((opt: string, msg: Message) => void)[]} = {};
    private _parser: CommandParser = new CommandParser(this);

    public RegisterOptionsRoutes(options: string[], f: (opt: string, msg: Message) => void) {
        for(const option of options) {
            const optionLower = option.trim().toLowerCase();
            if (!this._optionRoutes[optionLower]) {
                this._optionRoutes[optionLower] = [];
            }

            this._optionRoutes[optionLower].push(f);
        }
    }

    public RegisterRoute(command: string, f: (cmd: Command, msg: Message) => void) {
        this.RegisterSubroute(command.toLowerCase(), '.', f);
    }

    public RegisterSubroute(command: string, subcommand: string, f: (cmd: Command, msg: Message) => void) {
        command = command.toLowerCase();
        if (!this._routes[command]) {
            this._routes[command] = { 
                command: command, 
                subcommands: {} 
            };
        }

        this._routes[command].subcommands[subcommand.toLowerCase()] = f;
    }

    public GetAllCommands(): string[] {
        return [...Object.keys(this._routes)].sort();
    }

    public GetAllSubcommands(command: string): string[] {
        command = command.toLowerCase();
        return this._routes[command] ? Object.keys(this._routes[command].subcommands).sort() : [];
    }

    public IsOption(o: string) {
        return this._optionRoutes[o] && this._optionRoutes[o].length;
    }

    public CanRoute(c: Command) {
        return this._routes[c.command] && this._routes[c.command].subcommands[c.subcommand];
    }

    public async Evaluate(message: Message) {
        try {
            const opt = message.content.trim().toLowerCase();
            if (this.IsOption(opt)) {
                this._optionRoutes[opt].forEach(async f => { await f(opt, message) });
                return;
            }

            const cmd = this._parser.Parse(message.content);
            if (cmd) {
                await this._routes[cmd.command].subcommands[cmd.subcommand](cmd, message);
            }
        }
        catch (ex) {
            console.log(`There was an error processing command: ${message.content}`, ex);
        }
    }
}



class Route {
    command: string;
    subcommands: {[subcommand: string]: (cmd: Command, msg: Message) => void};
}