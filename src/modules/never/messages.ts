import { NeverHaveIEverState } from "./never";
import { RichResponseService, RichResponseType } from "../../infrastructure/services/rich-response-service";

export class NeverMessages {

    public NoGame() {

        return RichResponseService.CreateMessage(RichResponseType.Error)
            .addField('Never Have I Ever has not started.', 'To start a game, type `{prefix}never new`');
    }

    public Tally(state: NeverHaveIEverState) {
        let tallyText = state.scores.map(x => `${x.name} - ${x.score}`).join('\n');
        if (tallyText.length === 0) {
            tallyText = "No one has done anything!";
        }

        return RichResponseService.CreateMessage(RichResponseType.Pink)
            .addField('Never Have I Ever Tally', tallyText);
    }

    public Question(state: NeverHaveIEverState) {
        return RichResponseService.CreateMessage(RichResponseType.Pink)
            .addField(state.question, 'If *you* have, type "I have"');
    }
    
    public OnConfession(username: string) {
        return RichResponseService.CreateMessage(RichResponseType.Purple, `${username} has!`);
    }
}