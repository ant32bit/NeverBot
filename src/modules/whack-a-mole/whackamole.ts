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
}