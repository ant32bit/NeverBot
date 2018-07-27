import * as ConfigProvider from '../../infrastructure/config';

const _level = ConfigProvider.GetConfig<LevelData[]>('levels.json');
const _modifiers = ((): {[name: string]: Modifier} => {
    const modifiers: {[name: string]: Modifier} = {};
    ConfigProvider.GetConfig<Modifier[]>('modifiers.json').forEach(x => modifiers[x.name] = x);

    return modifiers;
})();

const _cards = ((): {[id: string]: CardData} => {
    const cards: {[id: string]: CardData} = {};
    ConfigProvider.GetConfig<CardData[]>('battlecards.json').forEach(x => cards[x.id] = x);

    return cards;
})();

const _cardRarity: { p: {[rarity: string]: number}; pTotal: number; } = (() => {
    const r = {
        p: { "C": 32, "U": 16, "R": 8, "SR": 4, "UR": 2, "L": 1 },
        pTotal: 0
    };

    r.pTotal = Object.keys(_cards).map(x => r.p[_cards[x].rarity]).reduce((a,b) => a + b, 0);

    return r;
})();

export class GameDataRepo {
    
    public GetCardData(id: string): CardData {
        return _cards[id];
    }

    public GetLevelData(level: number): LevelData {
        return _level[level - 1];
    }

    public GetModifier(name: string): Modifier {
        return _modifiers[name];
    }

    public PickCard(): string {
        const pRoll = Math.random() * _cardRarity.pTotal;
        let pSum = 0;
        
        for (const cardId of Object.keys(_cards)) {
            pSum += _cardRarity.p[_cards[cardId].rarity];
            if (pRoll < pSum) {
                return cardId;
            }
        }

        return null;
    }

    public GetLevelForXp(xp: number): number {
        for(let lvl = 0; lvl < _level.length; lvl++) {
            if (_level[lvl].xp_req > xp) {
                return lvl;
            }
        }

        return _level.length;
    }
}

export class LevelData {
    level: number;
    xp_req: number;

    hp_max: number;
    hp_rate: number;

    ap_max: number;
    ap_rate: number;
    
    atk_min: number;
    atk_max: number;

    crit_rate: number;
    crit_mult: number;
}

export class CardData {
    id: string;
    name: string;
    description: string;
    rarity: string;
    attributes: CardAttribute[];
}

export class CardAttribute {
    name: string;
    description: string;
    type: string;
    modifiers: string[];
}

export class Modifier {
    name: string;
    mod: string;
    min?: number;
    max?: number;
    percentage?: number;
    duration?: number;
    frequency?: number;
}