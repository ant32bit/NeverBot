
const valueOf = {
    '0': 0,  '1': 1,  '2': 2,  '3': 3,
    '4': 4,  '5': 5,  '6': 6,  '7': 7,
    '8': 8,  '9': 9,  'a': 10, 'b': 11,
    'c': 12, 'd': 13, 'e': 14, 'f': 15,
}

const numeralOf = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

export abstract class Converter {
        
    public static ChangeBase(v: string, from: number, to: number): string {
        let placeValue = 1;
        let value = 0;

        for (const numeral of v.split('').reverse()) {
            value += valueOf[numeral] * placeValue;
            placeValue *= from;
        }

        placeValue = 1;
        while (placeValue <= value) {
            placeValue *= to;
        }

        placeValue /= to;
        const numerals: string[] = [];
        
        while (placeValue >= 1) {
            const numeralValue = Math.floor(value / placeValue);

            numerals.push(numeralOf[numeralValue]);
            value -= numeralValue * placeValue;
            placeValue /= to;
        }

        if (numerals.length === 0) {
            numerals.push('0');
        }

        return numerals.join('');
    }
}
