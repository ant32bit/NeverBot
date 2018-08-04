import { RichEmbed } from "discord.js";
import * as ConfigProvider from '../../infrastructure/config';
import { NeverHaveIEverState } from "./never";

export class NeverMessages {

    private _prefix: string;

    private _colourError = 0xf44542;
    private _colourResponse = 0x8956bc;
    private _colourGame = 0xd151c2;

    constructor() {
        this._prefix = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json').prefix;
    }

    public NoGame() {

        return new RichEmbed()
            .setColor(this._colourError)
            .addField('Never Have I Ever has not started.', `To start a game, type \`${this._prefix}never new\``);
    }

    public Tally(state: NeverHaveIEverState) {
        let tallyText = state.scores.map(x => `${x.name} - ${x.score}`).join('\n');
        if (tallyText.length === 0) {
            tallyText = "No one has done anything!";
        }

        return new RichEmbed()
            .setColor(this._colourGame)
            .addField('Never Have I Ever Tally', tallyText);
    }

    public Question(state: NeverHaveIEverState) {
        return new RichEmbed()
            .setColor(this._colourGame)
            .addField(state.question, 'If *you* have, type "I have"');
    }
    
    public OnConfession(username: string) {
        return new RichEmbed()
            .setColor(this._colourResponse)
            .setDescription(`${username} has!`);
    }
}