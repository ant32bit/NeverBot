import * as ConfigProvider from '../../infrastructure/config';

const settings = ConfigProvider.GetConfig<CasinoSettings>('casino.json');
const cooldowns: {[user: string]: number} = {};

export class CasinoEngine {

    private slotRoller: SlotValue[] = [];

    constructor() {
        for (const value of Object.keys(settings.slots.symbols)) {
            this.slotRoller.push(...(settings.slots.symbols[value].map(x => <SlotValue>{
                symbol: x,
                value: value
            })));
        }
    }

    public getCooldown(user: string): number {
        const rn = Date.now();

        if (cooldowns[user]) {
            const elapsed = rn - cooldowns[user];

            if (elapsed < settings.cooldown) {
                return Math.ceil((settings.cooldown - elapsed) / 1000);
            }
        }

        cooldowns[user] = rn;
        return 0;
    } 

    public slots(): SlotsResult { 

        const patterns: string[] = [];
        const slots: SlotValue[] = [];
        const counts = {
            "jewels": 0,
            "fruit": 0,
            "vegetables": 0,
            "junk": 0
        };

        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * this.slotRoller.length);
            slots.push(this.slotRoller[idx]);
            counts[this.slotRoller[idx].value]++;
        }

        if (counts["jewels"] === 3) {
            patterns.push("three_jewels");
        }
        else if (counts["jewels"] === 2) {
            patterns.push("two_jewels");
        }
        else if (counts["jewels"] === 1) {
            patterns.push("one_jewel");
        }

        if (slots[0].symbol === slots[1].symbol && slots[1].symbol == slots[2].symbol) {
            patterns.push("three_of_a_kind");
        }

        if (counts["fruit"] === 3) {
            patterns.push("three_fruit");
        }
        else if (counts["vegetables"] === 3) {
            patterns.push("three_vegies");
        }
        else if (counts["fruit"] + counts["vegetables"] === 3) {
            patterns.push("three_fruit_and_veg");
        }

        if (counts["fruit"] === 2) {
            patterns.push("two_fruit");
        }
        else if (counts["vegetables"] === 2) {
            patterns.push("two_vegies");
        }
        else if (counts["fruit"] + counts["vegetables"] === 2) {
            patterns.push("two_fruit_and_veg");
        }

        if (patterns.length === 0 && (counts["fruit"] > 0 || counts["vegetables"] > 0)) {
            patterns.push("at_least_one_fv");
        }

        const result = <SlotsResult> {
            patterns: [],
            multiplier: null,
            slots: slots
        };

        for (const patternId of patterns) {
            const pattern = settings.slots.patterns[patternId];
            result.patterns.push(`${pattern.name} ${pattern.multiplier}x`);

            if (result.multiplier == null) {
                result.multiplier = 1;
            }

            result.multiplier *= pattern.multiplier;
        }

        if (result.patterns.length === 0) {
            result.patterns.push("You didn't win anything");
        }

        if (result.multiplier == null) {
            result.multiplier = 0;
        }

        return result;
    }
}

export class SlotsResult {
    patterns: string[];
    multiplier: number;
    slots: SlotValue[];
}

export class SlotValue {
    symbol: string;
    value: string;
}

export class CasinoSettings {
    cooldown: number;
    bet: {
        min: number,
        max: number
    };
    slots: {
        symbols: {
            jewels:string[], 
            fruit:string[], 
            vegetables:string[], 
            junk:string[] 
        },
        patterns: {[id: string]: {
                name: string,
                multiplier: number
            }
        }
    };
}
