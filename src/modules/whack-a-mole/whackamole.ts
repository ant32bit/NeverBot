export class Whackamole {

    private _mole = ":grimacing:";
    private _dead = ":dizzy_face:";
    private _hole = ":black_circle:";
    private _miss = ":x:";

    private _selection: number[];

    constructor(arg: string) {
        const numbers = arg
            .split('')
            .map(x => parseInt(x))
            .filter(x => x >= 1 && x <= 9);

        this._selection = [];
        while (this._selection.length < 3 && numbers.length > 0) {
            const n = numbers.shift();

            if (this._selection.indexOf(n) < 0) {
                this._selection.push(n);
            }
        }

        console.log(this._selection.map(x => x.toString()).join(","));
    }

    public get Result(): string {
        if (!this._selection || this._selection.length != 3) {
            return "to play whack-a-mole, pass three numbers between 1 and 9";
        }
        
        let holes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const moles: number[] = [];

        for (let i = 0; i < 3; i++) {
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
        
        let score = 0;

        let game: string = "";
        let col = 0;

        for (let i = 1; i <= 9; i++) {
            if (col == 3) {
                game += "\n";
                col = 0;
            }

            col++;

            const selected = this._selection.indexOf(i) >= 0;
            const mole = moles.indexOf(i) >= 0;

            if (mole && selected) {
                game += this._dead;
                score++;
            }
            else if(selected) {
                game += this._miss;
            }
            else if(mole) {
                game += this._mole;
            }
            else {
                game += this._hole;
            }
        }

        return `you hit ${score} out of 3\n\n${game}`;
    }
}