import { RichEmbed, Guild } from "discord.js";
import { ConfigService } from "../../../infrastructure/services";

export class BattleMessages {

    private _prefix: string;

    private _colourError = 0xf44542;
    private _colourWarning = 0xe8cb29;
    private _colourOK = 0xb2e829;

    constructor() {
        this._prefix = ConfigService.GetGlobalConfig().prefix;
    }

    public Syntax(command: string) {

        if (command === "warn") {
            return new RichEmbed()
                .setColor(this._colourError)
                .setDescription(`syntax: ${this._prefix}warn <member> <reason>`);
        }

        if (command === "unwarn") {
            return new RichEmbed()
                .setColor(this._colourError)
                .setDescription(`syntax: ${this._prefix}unwarn <member>`);
        }
        
        if (command === "warnings") {
            return new RichEmbed()
                .setColor(this._colourError)
                .setDescription("syntax: warnings [<member>]");
        } 

        return null;
    }

    public RequiresAdmin(action: string) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`You must be an admin to ${action}`);
    }

    public DatabaseError(error: string) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(error);
    }

    public UserWarned(username: string) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`${username} has been warned.`);
    }

    public UserUnwarned(username: string) {
        return new RichEmbed()
            .setColor(this._colourOK)
            .setDescription(`${username}'s last warning has been deleted`)
    }

    public NoWarnings(username?: string) {
        if (username) {
            return new RichEmbed()
                .setColor(this._colourError)
                .setDescription(`${username} does not have any warnings`);
        }
        else {
            return new RichEmbed()
                .setColor(this._colourWarning)
                .setDescription("There are no warnings issued");
        }
    }

    public ConfirmUnwarn(username: string, confirmCommand: string) {
        return new RichEmbed()
            .setColor(this._colourWarning)
            .setDescription(`Unwarn ${username}? say \`${confirmCommand}\` to unwarn.`);
    }
}