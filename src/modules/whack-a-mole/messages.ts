import { RichEmbed } from "discord.js";
import * as ConfigProvider from '../../infrastructure/config';

export class WhackamoleMessages {

    private _prefix: string;

    private _colourError = 0xf44542;
    private _colourHit = [0x0848af, 0x2362c6, 0x427edd, 0x6093e5];

    private _mole = ":grimacing:";
    private _dead = ":dizzy_face:";
    private _hole = ":black_circle:";
    private _miss = ":x:";

    private _text = [
        [   "Were you even looking?",
            "Who gave you a hammer?",
            "At least it can't get worse."
        ],
        [   "Better luck next time.",
            "Today is not your day.",
            "Try harder next time."
        ],
        [   "Almost!",
            "Oh! So close!",
            "You gave it a good go."
        ],
        [   "Sharp-shooter!",
            "You're a mole killer!",
            "BOOM BOOM BOOM!!!"
        ]
    ];

    constructor() {
        this._prefix = ConfigProvider.GetConfig<ConfigProvider.Config>('config.json').prefix;
    }

    public Syntax() {

        return new RichEmbed()
            .setColor(this._colourError)
            .setDescription(`syntax: ${this._prefix}whack <1-9> <1-9> <1-9>`);
    }

    public Results(moles: number[], whacks: number[]) {

        let score = 0;

        let game: string = "";
        let col = 0;

        for (let i = 1; i <= 9; i++) {
            if (col == 3) {
                game += "\n";
                col = 0;
            }

            col++;

            const whack = whacks.indexOf(i) >= 0;
            const mole = moles.indexOf(i) >= 0;

            if (mole && whack) {
                game += this._dead;
                score++;
            }
            else if(whack) {
                game += this._miss;
            }
            else if(mole) {
                game += this._mole;
            }
            else {
                game += this._hole;
            }
        }

        const textIdx = Math.floor(Math.random() * this._text[score].length);

        return new RichEmbed()
            .setColor(this._colourHit[score])
            .setDescription(`**${this._text[score][textIdx]}**`)
            .addField(`You hit ${score} out of 3 moles.`, game);
    }
}