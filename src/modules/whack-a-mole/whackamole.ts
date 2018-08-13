import { RichEmbed } from "discord.js";
import { RichResponseService, RichResponseType } from "../../infrastructure/services/rich-response-service";

const _typeByScore = [
    RichResponseType.Blue_Darkest, 
    RichResponseType.Blue_Dark, 
    RichResponseType.Blue,
    RichResponseType.Blue_Light    
];

const _mole = ":grimacing:";
const _dead = ":dizzy_face:";
const _hole = ":black_circle:";
const _miss = ":x:";

const _text = [
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

export class WhackamoleEngine {
    

    constructor(private nMoles: number) {}

    public ParseWhacks(content: string): number[] {
        const numbers = content
            .split('')
            .map(x => parseInt(x))
            .filter(x => x >= 1 && x <= 9);

        const whacks = [];
        while (whacks.length < this.nMoles && numbers.length > 0) {
            const n = numbers.shift();

            if (whacks.indexOf(n) < 0) {
                whacks.push(n);
            }
        }

        return whacks.length === this.nMoles ? whacks : null;
    }

    public GenerateMoles(): number[] {
        let holes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const moles: number[] = [];

        for (let i = 0; i < this.nMoles; i++) {
            const idx = Math.floor(Math.random() * holes.length);

            moles.push(holes[idx]);

            const newHoles = [];
            for (var j = 0; j < holes.length; j++) {
                if (j !== idx) {
                    newHoles.push(holes[j]);
                }
            }

            holes = newHoles;
        }

        return moles;
    }

    public Result(moles: number[], whacks: number[]): RichEmbed {

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
                game += _dead;
                score++;
            }
            else if(whack) {
                game += _miss;
            }
            else if(mole) {
                game += _mole;
            }
            else {
                game += _hole;
            }
        }

        const textIdx = Math.floor(Math.random() * _text[score].length);

        return RichResponseService.CreateMessage(_typeByScore[score], `**${_text[score][textIdx]}**`)
            .addField(`You hit ${score} out of 3 moles.`, game);
    }
}