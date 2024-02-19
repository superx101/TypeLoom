import { LanguageHandleStrategy } from "../i18nUtil";

export class CNHandleStrategy implements LanguageHandleStrategy {
    public formatTexts(lines: string[]): string[] {
        return lines;
    }
}