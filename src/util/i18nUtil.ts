import { SingletonProperty } from "./classDecorator";
import { USHandleStrategy } from "./i18nUtils/enHandleStrategy";
import { CNHandleStrategy } from "./i18nUtils/zhHandleStrategy";

import { ASTNode, ASTPtr } from "../ast/astNode";

export type LangRecord = Record<string, string>;

export enum LanguageCode {
  en_us = "en_us",
  zh_cn = "zh_cn",
}

export interface LanguageHandleStrategy {
  /**
   * Formatting the target language, e.g. line breaks
   * @param lines
   */
  formatTexts(lines: string[]): string[]
}

export class DefaultHandleStrategy implements LanguageHandleStrategy {
    public formatTexts(lines: string[]): string[] {
        return lines;
    }
}

export class LanguageHandleStrategyFactory {
    public static create(langCode: LanguageCode): LanguageHandleStrategy {
        switch (langCode) {
        case LanguageCode.en_us:
            return new USHandleStrategy();
        case LanguageCode.zh_cn:
            return new CNHandleStrategy();
        default:
            return new DefaultHandleStrategy();
        }
    }
}

export class Translator {
    constructor(private langMap: LangRecord, private languageHandleStrategy: LanguageHandleStrategy) {}

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

    public getKeyByNode(node: ASTNode) {
        const keyArr: string[] = [];
        let ptr: ASTPtr = node;
        while (ptr) {
            keyArr.push(ptr.name);
            ptr = ptr.parent;
        }
        keyArr.pop();
        return keyArr.reverse().join(".");
    }
}