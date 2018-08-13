
export interface ICasinoSettings {
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