import { Message } from "discord.js";
import { Command } from "./command";
import { CommandParser } from "./command-parser";


export class CommandRouterService {
    private _routes: {[command: string]: Route} = {};
    private _parser: CommandParser = new CommandParser(this);

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
        return Object.keys(this._routes).sort();
    }

    public GetAllSubcommands(command: string): string[] {
        command = command.toLowerCase();
        return this._routes[command] ? Object.keys(this._routes[command].subcommands).sort() : [];
    }

    public CanRoute(c: Command) {
        return (this._routes[c.command] && this._routes[c.command].subcommands[c.subcommand]);
    }

    public async Evaluate(message: Message) {
        const cmd = this._parser.Parse(message.content);
        if (cmd) {
            await this._routes[cmd.command].subcommands[cmd.subcommand](cmd, message);
        }
    }
}

class Route {
    command: string;
    subcommands: {[subcommand: string]: (cmd: Command, msg: Message) => void};
}