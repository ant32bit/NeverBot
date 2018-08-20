export interface IShop {
    id: string;
    name: string;
    items: { item: string; price: number; }[];
}