import * as fs from 'fs';
import { IConfig } from '../configs/config';

const _configDir = './config';
const _cache: {[filename: string]: any} = {};

export abstract class ConfigService {

    public static GetGlobalConfig(): IConfig { return this.GetConfig<IConfig>('config.json'); }

    public static GetConfig<T>(filename: string): T {
        const configFilename = `${_configDir}/${filename}`;
    
        if (_cache[filename]) {
            return _cache[filename];
        }
        else if (fs.existsSync(configFilename)) {
            const configJsonSer = fs.readFileSync(configFilename, { encoding: 'utf8' });
            _cache[filename] = JSON.parse(configJsonSer);
            return _cache[filename];
        }
        else {
            fs.writeFileSync(configFilename, '', { encoding: 'utf8' });
            throw(`please set up ${configFilename}`);
        }
    }
}





