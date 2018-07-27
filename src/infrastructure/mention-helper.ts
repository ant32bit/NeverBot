export abstract class MentionHelper {
    
    public static GetIdFromMention(mention: string): string {
        const match = /^<@!?(\d+)>$/.exec(mention);
        return match ? match[1] : null;
    }
}