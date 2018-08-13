import { CommandRouterService } from "./command-router";
import { Command } from "./command";
import { ConfigService } from "./services/config-service";

export class CommandParser {

    private _prefix: string;

    constructor (private _routerService: CommandRouterService)
    {
        const config = ConfigService.GetGlobalConfig();
        this._prefix = config.prefix.toLowerCase();
    }

    public Parse(msg: string): Command {

        msg = msg.trimRight();

        const msgCaseInsensitive = msg.toLowerCase();
        const commands = this._routerService.GetAllCommands();
        for (let command of commands) {
            const parseCommand = this._prefix + command;

            if (msgCaseInsensitive === parseCommand) {
                return this.BuildCommand(command, '.', []);
            }

            if (msgCaseInsensitive.startsWith(parseCommand + ' ')) {
                const tail = this.StripLeading(msg, parseCommand);
                const tailCaseInsensitive = tail.toLowerCase();
                
                var subcommands = this._routerService.GetAllSubcommands(command);
                let hasDefault: boolean = false;

                for (let subcommand of subcommands) {
                    if (subcommand === '.') {
                        hasDefault = true;
                        continue;
                    }

                    if (tailCaseInsensitive === subcommand) {
                        return this.BuildCommand(command, subcommand, []);
                    }

                    if (tailCaseInsensitive.startsWith(subcommand + ' ')) {
                        return this.BuildCommand(command, subcommand, this.StripLeading(tail, subcommand).split(' '));
                    }
                }

                if (hasDefault) {
                    return this.BuildCommand(command, '.', tail.split(' '));
                }
            }
        }

        return null;
    }

    private BuildCommand(command: string, subcommand: string, args: string[]): Command {
        const c = {
            command: command,
            subcommand: subcommand,
            args: args
        };

        return this._routerService.CanRoute(c) ? c : null;
    }

    private StripLeading(text: string, substring: string): string {
        if (text.toLowerCase().startsWith(substring)) {
            return text.substring(substring.length).trimLeft();
        }

        return text.trimLeft();
    }
}