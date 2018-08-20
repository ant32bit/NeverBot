import { IBuffDefinition, IModifierDefinition } from "../dtos";

class ModUtil {

    private static _mods = {
        "hp_mod": {
            icon: '❤️',
            def: {
                description: (m: IModifierDefinition) => `Heals ${ModUtil._stringifyValue(m.min, m.max, m.percentage)} HP ${ModUtil._stringifyDuration(m.frequency, m.duration)}`,
            }
        },
        "ap_mod": {
            icon: '⭐️',
            def: {
                description: (m: IModifierDefinition) => `Recovers ${ModUtil._stringifyValue(m.min, m.max, m.percentage)} AP ${ModUtil._stringifyDuration(m.frequency, m.duration)}`,
            }
        },
        "atk_mod": {
            icon: '⚔️',
            def: {
                description: (m: IModifierDefinition) => `Increase ATK by ${ModUtil._stringifyValue(m.min, m.max, m.percentage)} ${ModUtil._stringifyDuration(m.frequency, m.duration)}`,
            }
        }
    }

    public static Icon(m: IModifierDefinition) { return this._mods[m.mod].icon; }
    public static Description(m: IModifierDefinition) { return this._mods[m.mod].def.description(m); }

    private static _stringifyDuration(frequency?: number, duration?: number): string {
        if (frequency != null && duration != null) {
            return `every ${frequency}s for ${duration}s`;
        }
        else if (duration != null) {
            return `for ${duration}s`;
        }
        else {
            return '';
        }
    }

    private static _stringifyValue(min?: number, max?: number, percentage?: number) {
        if (min != null && max != null) {
            if (min === max) {
                return min.toString();
            }
            if (min > max) {
                return `${max} - ${min}`;
            }
            else {
                return `${min} - ${max}`;
            }
        }
        else if (min != null) {
            return min.toString();
        }
        else if (max != null) {
            return max.toString();
        }
        else if (percentage != null) {
            return `${Math.floor(percentage * 100).toString()}%`
        }
        else {
            return '0';
        }
    }
}


export abstract class BuffService {

    public static Stringify(buff: IBuffDefinition): string {
        let buffStat = buff.modifiers.map(x => ModUtil.Icon(x)).join('');
        let buffDescs = buff.modifiers.map(x => ModUtil.Description(x)).join('\n');

        return `${buff.name} (${buffStat})\n${buffDescs}`;
    }
}