export interface IBankAccount {
    id?: number;
    user: string;
    amount: number;
    lastDaily: number;
    dailyStreak: number;
}