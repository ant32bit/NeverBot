

export interface IBuff {
    status: string;
    icon: string;
    startDate: number;
    modifiers: IModifier[];
    from?: string;
}

export interface IModifier {
    mod: string;
    value?: number;
    percentage?: number;
    duration?: number;
    frequency?: number;
}