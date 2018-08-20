export interface IItem {
    name: string;
    icon: string;
    buff: IBuffDefinition;
}

export class IBuffDefinition {
    name: string;
    modifiers: IModifierDefinition[];
}

export class IModifierDefinition {
    mod: string;
    min?: number;
    max?: number;
    percentage?: number;
    duration?: number;
    frequency?: number;
}