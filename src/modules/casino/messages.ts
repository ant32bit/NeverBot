import { RichEmbed } from "discord.js";
import * as ConfigProvider from '../../infrastructure/config';
import { SlotsResult } from "./casino";

export class CasinoMessages {

    private _prefix: string;
    private _symbol: string;

    private _colourError = 0xf44542;
    private _colourResponse = 0x0bd6e5;

    constructor() {
        const config = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json');
        this._prefix = config.prefix;
        this._symbol = config.currency;
    }

    public Syntax(command: string) {
        if (command === "slots") {
            return new RichEmbed()
                .setColor(this._colourError)
                .setDescription(`usage \`${this._prefix}slots [amount]\``);
        }
    }

    public NotEnoughMoney(username: string) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`${username} does not have enough to place a bet`);
    }

    public Cooldown(username: string, cooldown: number) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`${username}, please wait **${cooldown}s** before trying again`);
    }

    public BetTooLow(username: string, minBet: number) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`${username}, you must bet at least ${this._symbol}${minBet}`);
    }

    public BetTooHigh(username: string, maxBet: number) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`${username}, maximum bet is ${this._symbol}${maxBet}`);
    }

    public SlotResult(username: string, bet: number, winnings: number, result: SlotsResult) {
        const embed = new RichEmbed().setColor(this._colourResponse);

        embed.addField(
            `${username} bet ${this._symbol}${bet}`, 
            `${result.slots[0].symbol} ${result.slots[1].symbol} ${result.slots[2].symbol}`
        );

        if (winnings > 0) {
            embed.addField(
                `...and won ${this._symbol}${winnings}`,
                result.patterns.join('\n')
            );
        }
        else {
            embed.addField("...and lost!", "Better luck next time.");
        }

        return embed;
    }
}