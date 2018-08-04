import { RichEmbed } from "discord.js";
import * as ConfigProvider from '../../infrastructure/config';
import { BankAccount } from "./bank-repo";

export class BankMessages {

    private _prefix: string;
    private _symbol: string;

    private _colourError = 0xf44542;
    private _colourResponse = 0x0bd6e5;

    constructor() {
        const config = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json');
        this._prefix = config.prefix;
        this._symbol = config.currency;
    }

    public Apply(username: string, amount: number) {
        return new RichEmbed()
            .setColor(this._colourResponse)
            .setDescription(`**${username}'s** account now has ${this._symbol}${amount}`);
    }

    public Daily(username: string, amount: number) {
        return new RichEmbed()
            .setColor(this._colourResponse)
            .setDescription(`**${username}** has received ${this._symbol}${amount}. Come back tomorrow.`);
    }

    public DailyUnavailable(username: string) {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`**${username}** has already received a daily. Try again tomorrow.`);
    }

    public AccountDetails(username: string, acc: BankAccount) {
        return new RichEmbed()
            .setColor(this._colourResponse)
            .setDescription(`**${username}** has ${this._symbol}${acc.amount}`)
    }
}