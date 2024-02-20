import { ASTNode, ASTPtr } from "../../ast/astNode";
import { SingletonProperty } from "../classDecorator";


export type LangRecord = Record<string, string>;

export enum LanguageCode {
  en_us = "en_us",
  zh_cn = "zh_cn",
}

export interface LangFormatStrategy {
    /**
     * Formatting the target language, e.g. line breaks
     * @param lines
     */
    formatTexts(lines: string[]): string[];
}

export class Translator {
    constructor(private langMap: LangRecord, private languageHandleStrategy: LangFormatStrategy) {}

    public formatTexts(lines: string[]): string[] {
        return this.languageHandleStrategy.formatTexts(lines);
    }

    public tr(key: string): string | string[] {
        if (key in this.langMap)
            return this.langMap[key];
        return key;
    }
}

export class I18nUtil {
    @SingletonProperty
    public static readonly instance: I18nUtil;

    public formatKeyItem(key: string): string {
        let formattedKey = "";
        let isFirstChar = true;
        for (const char of key)
            if (char >= "A" && char <= "Z") {
                if (isFirstChar) {
                    formattedKey += char.toLowerCase();
                    isFirstChar = false;
                }
                else {
                    formattedKey += `-${char.toLowerCase()}`;
                }
            }
            else {
                formattedKey += char;
                isFirstChar = false;
            }
        return formattedKey;
    }

    public getKeyByNode(node: ASTNode): string {
        const keyArr: string[] = [];
        let ptr: ASTPtr = node;
        while (ptr) {
            keyArr.push(this.formatKeyItem(ptr.name));
            ptr = ptr.parent;
        }
        keyArr.pop();
        return keyArr.reverse().join(".");
    }
}