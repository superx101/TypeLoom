import { I18nUtil } from "./util";

import { ASTNode, FunctionLikeNode } from "../../ast/astNode";
import { DocFlagKind, WrongFlagError } from "../../ast/docFlag";
import { CodeCofig } from "../../generator/code";
import { SingletonProperty } from "../classDecorator";

export interface FlagKeysStrategy {
    getKeys(node: ASTNode, flagName: string): string[];
}
export class NonExpandedFlagStrategy implements FlagKeysStrategy {
    @SingletonProperty
    public static readonly instance: FlagKeysStrategy;

    public getKeys(node: ASTNode, flagName: string): string[] {
        const baseKey = I18nUtil.instance.getKeyByNode(node);
        return [`${baseKey}.${flagName}`];
    }
}

export class ExampleFlagStrategy implements FlagKeysStrategy {
    @SingletonProperty
    public static readonly instance: FlagKeysStrategy;

    public getKeys(node: ASTNode, flagName: string,): string[] {
        const baseKey = I18nUtil.instance.getKeyByNode(node);
        const keys: string[] = [];
        CodeCofig.instance.supportedLanguages.forEach((code) => {
            keys.push(`${baseKey}.${flagName}.${code}`);
        });
        return keys;
    }
}

export class ParamFlagStrategy implements FlagKeysStrategy {
    @SingletonProperty
    public static readonly instance: FlagKeysStrategy;

    public getKeys(node: ASTNode, _flagName: string): string[] {
        if (!(node instanceof FunctionLikeNode))
            throw new WrongFlagError(
                `'${node.name}' is not functionLikeNode, do not allow use 'params' tag`,
            );

        const baseKey = I18nUtil.instance.getKeyByNode(node);
        return node.parameters.map((param) => `${baseKey}.param.${param.name}`);
    }
}
