import * as ConfigProvider from '../../infrastructure/config';
import { CasinoSettings } from './casino';

const settings = ConfigProvider.GetConfig<CasinoSettings>('casino.json');

export class CasinoStats {

    private _E: number = 0;
    public get E(): number { return this._E; }

    constructor() {
        const p: {[id: string]: number} = {};
        const m: {[id: string]: number} = {};
        const total: number  = Object.keys(settings.slots.symbols).reduce((a, b) => a += settings.slots.symbols[b].length, 0);

        p["c"] = settings.slots.symbols.jewels.length / total;
        p["f"] = settings.slots.symbols.fruit.length / total;
        p["v"] = settings.slots.symbols.vegetables.length / total;
        p["j"] = settings.slots.symbols.junk.length / total;

        p["three_of_a_kind"] = Math.pow(1 / total, 3);

        p["3c_s"] = settings.slots.symbols.jewels.length * p["three_of_a_kind"];
        m["3c_s"] = CasinoStats.CalcMult('three_jewels', 'three_of_a_kind');

        p["3c"] = Math.pow(p["c"], 3) - p["3c_s"];
        m["3c"] = CasinoStats.CalcMult('three_jewels');

        p["2c_j"] = 3 * (Math.pow(p["c"], 2) * p["j"]);
        m["2c_j"] = CasinoStats.CalcMult('two_jewels');

        p["2c_fv"] = 3 * (Math.pow(p["c"], 2) * (p["f"] + p["v"]));
        m["2c_fv"] = CasinoStats.CalcMult('two_jewels', 'at_least_one_fv');
        
        p["1c_j_fv"] = 6 * (p["c"] * p["j"] * (p["f"] + p["v"]));
        m["1c_j_fv"] = CasinoStats.CalcMult('one_jewel', 'at_least_one_fv');

        p["1c_2j"] = 3 * (p["c"] * Math.pow(p["j"], 2));
        m["1c_2j"] = CasinoStats.CalcMult('one_jewel');

        p["1c_2v"] = 3 * (p["c"] * Math.pow(p["v"], 2));
        m["1c_2v"] = CasinoStats.CalcMult('one_jewel', 'two_vegies', 'at_least_one_fv');

        p["1c_2f"] = 3 * (p["c"] * Math.pow(p["f"], 2));
        m["1c_2f"] = CasinoStats.CalcMult('one_jewel', 'two_fruit', 'at_least_one_fv');

        p["1c_2fv"] = 6 * (p["c"] * p["f"] * p["v"]);
        m["1c_2fv"] = CasinoStats.CalcMult('one_jewel', 'two_fruit_and_veg', 'at_least_one_fv');

        p["3f_s"] = settings.slots.symbols.fruit.length * p["three_of_a_kind"];
        m["3f_s"] = CasinoStats.CalcMult('three_of_a_kind', 'three_fruit', 'at_least_one_fv');

        p["3f"] = Math.pow(p["f"], 3) - p["3f_s"];
        m["3f"] = CasinoStats.CalcMult('three_fruit', 'at_least_one_fv');
        
        p["2f_v"] = 3 * (Math.pow(p["f"], 2) * p["v"]);
        m["2f_v"] = CasinoStats.CalcMult('three_fruit_and_veg', 'two_fruit', 'at_least_one_fv');

        p["2f_j"] = 3 * (Math.pow(p["f"], 2) * p["j"]);
        m["2f_j"] = CasinoStats.CalcMult('two_fruit', 'at_least_one_fv');

        p["3v_s"] = settings.slots.symbols.vegetables.length * p["three_of_a_kind"];
        m["3v_s"] = CasinoStats.CalcMult('three_of_a_kind', 'three_vegies', 'at_least_one_fv');

        p["3v"] = Math.pow(p["v"], 3) - p["3f_s"];
        m["3v"] = CasinoStats.CalcMult('three_vegies', 'at_least_one_fv');

        p["2v_f"] = 3 * (Math.pow(p["v"], 2) * p["f"]);
        m["2v_f"] = CasinoStats.CalcMult('three_fruit_and_veg', 'two_vegies', 'at_least_one_fv');

        p["2v_j"] = 3 * (Math.pow(p["v"], 2) * p["j"]);
        m["2v_j"] = CasinoStats.CalcMult('two_vegies', 'at_least_one_fv');

        p["2fv_j"] = 6 * (p["f"] * p["v"] * p["j"]);
        m["2fv_j"] = CasinoStats.CalcMult('two_fruit_and_veg', 'at_least_one_fv');
        
        p["3j_s"] = settings.slots.symbols.junk.length * p["three_of_a_kind"];
        m["3j_s"] = CasinoStats.CalcMult('three_of_a_kind');

        p["3j"] = Math.pow(p["j"], 3) - p["3j_s"];
        m["3j"] = 0;
        
        p["2j_fv"] = 3 * (Math.pow(p["j"], 2) * (p["f"] + p["v"]));
        m["2j_fv"] = CasinoStats.CalcMult('at_least_one_fv');

        let pTotal = 0;
        let E = 0;

        for (let x of Object.keys(m)) {
            pTotal += p[x];
            E += p[x] * m[x];
        }

        this._E = E;
    }

    public static CalcMult(...mults: string[]) {
        return mults.reduce((a, b) => a *= settings.slots.patterns[b].multiplier, 1);
    }
}

