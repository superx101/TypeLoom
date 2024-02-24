import {
    ExampleFlagStrategy,
    NonExpandedFlagStrategy,
    ParamFlagStrategy,
} from "./FlagKeysStrategyImpl";
import { LangFormatStrategy, LangFormatStrategyFactory } from "./langFormatStrategyImpl";

import { ASTNode, ASTPtr, RootNode } from "../../ast/astNode";
import { DocFlagKind, DocFlagUtil, WrongFlagError } from "../../ast/docFlag";
import { ASTNodeVisitor } from "../astUtil";
import { SingletonProperty } from "../classDecorator";

export type TranslatedValue = string | string[]
export type LangRecord = Record<string, TranslatedValue>;

export enum LanguageCode {
    en_us = "en_us",
    zh_cn = "zh_cn",
}

export class Translator {
    private langFormatStrategy: LangFormatStrategy;

    constructor(
        private langMap: LangRecord,
        private langCode: LanguageCode,
    ) {
        this.langFormatStrategy = LangFormatStrategyFactory.create(langCode);
    }

    public getLangCode(): LanguageCode {
        return this.langCode;
    }

    public formatTexts(lines: string[]): string[] {
        return this.langFormatStrategy.formatTexts(lines);
    }

    public tr(key: string): TranslatedValue {
        const value: TranslatedValue | undefined = this.langMap[key];
        if (!value || value == "" || value.length == 0)
            return key;
        return this.langMap[key];
    }
}

export class I18nUtil {
    @SingletonProperty
    public static readonly instance: I18nUtil;

    protected strategyMap = new Map([
        [DocFlagKind.Text, NonExpandedFlagStrategy.instance],
        [DocFlagKind.Deprecated, NonExpandedFlagStrategy.instance],
        [DocFlagKind.Example, ExampleFlagStrategy.instance],
        [DocFlagKind.Params, ParamFlagStrategy.instance],
        [DocFlagKind.Returns, NonExpandedFlagStrategy.instance],
    ]);

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

    public getKeys(node: ASTNode, flagName: string): string[] {
        let strategy = this.strategyMap.get(flagName as DocFlagKind);
        try {
            if (!strategy)
                strategy = NonExpandedFlagStrategy.instance;
            return strategy.getKeys(node, flagName);
        }
        catch (err: unknown) {
            if (err instanceof WrongFlagError)
                console.warn(err.message);
            else
                throw err;
        }
        return [];
    }

    public createKeyMaps(node: ASTNode): Record<string, string> {
        const keysMap: Record<string, string> = {};
        ASTNodeVisitor.instance.visitNode(null, node, (parent, child) => {
            if (child instanceof RootNode)
                return;
            if (!child.docFlags || !child.docFlags.enable)
                return;

            const visitedCountMap = new Map<string, number>();
            child.docFlags.flags.forEach((flag) => {
                const index = visitedCountMap.get(flag) || 0;
                const name = DocFlagUtil.instance.isRepeatable(flag) ? flag + index : flag;
                const keys = this.getKeys(child, name);
                visitedCountMap.set(flag, index + 1);

                for (const key of keys)
                    if (key != "")
                        keysMap[key] = "";
            });
        });
        return keysMap;
    }
}
