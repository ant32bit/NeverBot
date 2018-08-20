import { ConfigService } from "./config-service";
import { IItem } from "../dtos";
import { BuffService } from "./buff-service";

const _items = ConfigService
                .GetConfig<IItem[]>('items.json')
                .reduce((a,b) => { a[b.name] = b; return a; }, <{[name: string]: IItem}>{});

export abstract class ItemService {

    public static get(name: string): IItem {
        return _items[name];
    }

    public static field(name: string): {name: string, value: string} {
        const item = this.get(name);

        if (item) {
            return  {
                name: `${item.icon} ${item.name}`,
                value: `${BuffService.Stringify(item.buff)}`
            };
        }

        return null;
    }
}