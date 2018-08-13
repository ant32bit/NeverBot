import { IQuery } from "../query-dispatcher";
import { ConfigService } from "../../services";
import { ILevelData } from "../../configs";

const _level = ConfigService.GetConfig<ILevelData[]>('levels.json');

export class GetLevelQuery implements IQuery {

    constructor(private _xp: number) { }

    run(): ILevelData {
        for(let lvl = 0; lvl < _level.length; lvl++) {
            if (_level[lvl].xp_req > this._xp) {
                return _level[lvl - 1];
            }
        }

        return _level[_level.length - 1];
    }
}