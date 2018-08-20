import { IShop, IItem } from "../dtos";
import { ConfigService } from "./config-service";

const _shops = ConfigService.GetConfig<IShop[]>('shops.json');
const _shopsIdx = _shops.reduce((v,x,i) => {v[x.id.toLowerCase()] = i; return v;}, <{[id: string]: number}>{});
const _items = (() => {
    const items: {[name: string]: {shop: string, price: number}[]} = {};

    for (const shop of _shops) {
        for (const item of shop.items) {
            const name = item.item.toLowerCase();
            if (!items[name]) {
                items[name] = [];
            }

            items[name].push({ shop: shop.name, price: item.price });
        }
    }

    return items;
})();

export abstract class ShopService {

    public static Shops(): { id: string; name: string; }[] {
        return _shops.map(x => { return { id: x.id, name: x.name } });
    }

    public static Shop(id: string): IShop {
        const i = _shopsIdx[id.toLowerCase()];
        return i >= 0 ? _shops[i] : null;
    }

    public static Item(name: string): {shop: string, price: number}[] {
        return _items[name.toLowerCase()] || [];
    }
}