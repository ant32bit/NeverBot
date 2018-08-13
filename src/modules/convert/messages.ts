import { RichEmbed } from "discord.js";
import { ConfigService } from "../../infrastructure/services";

export class ConverterMessages {

    private _prefix: string;

    private _colourError = 0xf44542;
    private _colourResponse = 0xc9a30c;

    constructor() {
        this._prefix = ConfigService.GetGlobalConfig().prefix;
    }

    public Syntax() {
        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`**${this._prefix}convert Syntax**\nconvert numbers from one base to another`)
            .addField('provide number in proper notation',
                [   '`hex`: preceding 0x (e.g. 0x0fe392dd)',
                    '`oct`: preceding 0 (e.g. 042)',
                    '`dec`: no features (e.g. 1748)',
                    '`bin`: ending b (e.g 01001110b)'
                ].join('\n'))
            .addField('base to convert to:', '`-bin`, `-oct`, `-dec`, `-hex`\nif not provided, default is dec.')
            .addField('example usage', `input: \`${this._prefix}convert 0x4857 -bin\`\noutput: \`0x4857 = 100100001010111b\``);
    }

    public Output(input: string, output: string) {
        return new RichEmbed()
            .setColor(this._colourResponse)
            .setDescription(`\`${input} = ${output}\``);
    }
}