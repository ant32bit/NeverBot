
import * as Translate from '@google-cloud/translate';
import { ConfigService } from './config-service';

const keyFilename = ConfigService.GetGlobalConfig().googleApiKeyPath;
const translate = new Translate({keyFilename: keyFilename});

export abstract class TranslationService {

    public static Translate(text: string, target: string, f: (err: Error, translation: ITranslation) => void) {
        translate
            .translate(text, target)
            .then(result => {
                try {
                    const resultData = result[1].data.translations;
                    const translation: ITranslation = Array.isArray(resultData) ? resultData[0] : resultData;
                    f(null, translation);
                }
                catch(e) {
                    f(e, null);
                }
            })
            .catch(e => f(e, null));
    }

    public static SupportedLanguages(f: (err: Error, supportedLanguages: ISupportedLanguage[]) => void) {
        translate
            .getLanguages('en')
            .then(r => f(null, r[0]))
            .catch(e => f(e, null));
    }
}

export interface ITranslation {
    translatedText: string;
    detectedSourceLanguage: string;
}

export interface ISupportedLanguage {
    code: string;
    name: string;
}