import { Questions } from "./questions";
import { User } from "discord.js";

export class NeverHaveIEverServer {
    private _available: number[];
    private _scores: NeverHaveIEverGame[];
    private _currentGame: number;

    constructor(private _server: string) {
        this._available = [];
        this._scores = [];

        this.Next();
    }

    public Next() {
        console.log(`New game on ${this._server}`);

        if (this._available.length === 0) {
            this._reset();
        }

        const idx = Math.floor(Math.random() * this._available.length);

        this._currentGame = this._scores.length;
        this._scores.push({ questionId: this._available[idx], admitters: [] });

        const newAvailable = [];
        for(var i = 0; i < this._available.length; i++) {
            if (i !== idx) {
                newAvailable.push(this._available[i]);
            }
        }

        this._available = newAvailable;      
        
        console.log(`Question on ${this._server} is \"${Questions.List[this._scores[this._currentGame].questionId]}\"`);
    }

    public Confess(user: User) {
        console.log(`user ${user.id} (${user.username}) confessed on ${this._server}`);

        if (this._scores[this._currentGame].admitters.findIndex(x => x.id === user.id) < 0) {
            this._scores[this._currentGame].admitters.push({ id: user.id, name: user.username });
        }
    }

    public GetState(): NeverHaveIEverState {
        console.log(`request for tally on ${this._server}`);

        const tally: {[user: string]: number} = {};
        
        for(let s of this._scores) {
            for (let admitter of s.admitters) {
                if (!tally.hasOwnProperty(admitter.name)) {
                    tally[admitter.name] = 0;
                }

                tally[admitter.name]++;
            }
        }
        
        const state = <NeverHaveIEverState>{
            scores: [],
            question: Questions.List[this._scores[this._currentGame].questionId],
            admitters: this._scores[this._currentGame].admitters.map(x => x.name).sort()
        }

        for(let name of Object.keys(tally)) {
            state.scores.push({ name: name, score: tally[name] });
        }

        state.scores = state.scores.sort((a,b) => { return b.score > a.score ? 1 : b.score < a.score ? -1 : 0; });
    
        return state;
    }

    private _reset() {
        this._available = [];
        for (let i = 0; i < Questions.List.length; i++) {
            this._available.push(i);
        }
    }
}

class NeverHaveIEverGame {
    public questionId: number;
    public admitters: { id: string, name: string }[];    
}

export class NeverHaveIEverState {
    public scores: { name: string, score: number }[];
    public question: string;
    public admitters: string[];
}

