import { CommandRouterService } from "../../infrastructure/command-router";
import { Message } from "discord.js";
import { Converter } from './convert';
import { ConverterMessages } from "./messages";

const _message = new ConverterMessages();

export abstract class ConverterRoutes {

    public static RegisterRoutes(router: CommandRouterService) {

        const help = "**convert usage**\nconvert numbers from one base to another\n\nprovide number in proper notation:\n**hex**: preceding 0x (e.g. 0x0fe392dd)\n**oct**: preceding 0 (e.g. 042)\n**dec**: no features (e.g. 1748)\n**bin**: ending b (e.g 01001110b)\n\nbase to convert to:\n`-bin`, `-oct`, `-dec`, `-hex`\nif not provided, default is dec.\n\nexample usage:\nn$convert 0x4857 -bin";

        const getBaseFromArg = (s: string): {base: number, prefix: string, suffix: string} => {
            return {
                '-bin': { base: 2, prefix: '', suffix: 'b' },
                '-oct': { base: 8, prefix: '0', suffix: '' },
                '-dec': { base: 10, prefix: '', suffix: '' },
                '-hex': { base: 16, prefix: '0x', suffix: '' }
            }[s.toLowerCase()];
        }

        const getBaseFromNumber = (s: string): {base: number, value: string} => {
            const sLower = s.toLowerCase();
            if (/^0x[0-9a-f]+$/.test(sLower)) {
                return {
                    base: 16, 
                    value: sLower.substring(2)
                };
            }

            if (/^[01]+b$/.test(sLower)) {
                return {
                    base: 2,
                    value: sLower.substring(0, sLower.length - 1)
                };
            }

            if (/^0[0-7]+$/.test(sLower)) {
                return {
                    base: 8,
                    value: sLower
                }
            }

            if (/^[0-9]+$/.test(sLower)) {
                return {
                    base: 10,
                    value: sLower
                }
            }

            return null;
        }

        router.RegisterRoute('convert', (c, m) => {
            if (c.args.length < 1) {
                m.channel.send(_message.Syntax()).then(msg => (<Message>msg).delete(30000));
                return;
            }

            const number = getBaseFromNumber(c.args[0]);
            const toBase = getBaseFromArg(c.args.length >= 2 ? c.args[1] : '-dec');

            if (number === null || toBase === null) {
                m.channel.send(_message.Syntax()).then(msg => (<Message>msg).delete(30000));
                return;
            }

            const converted = toBase.prefix + Converter.ChangeBase(number.value, number.base, toBase.base) + toBase.suffix

            m.channel.send(_message.Output(c.args[0].toLowerCase(), converted));
        });
    }
}


