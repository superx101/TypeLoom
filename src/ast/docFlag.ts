import { ASTNode } from "./astNode";

import { SingletonProperty } from "../util/classDecorator";

export class WrongFlagError extends Error {}

export interface DocFlags {
    enable: boolean;
    flags: string[];
}

export enum DocFlagKind {
    Deprecated = "deprecated",
    Text = "text",
    Example = "example",
    Params = "params",
    Returns = "returns",
}

export class DocFlagUtil {
    @SingletonProperty
    public static readonly instance: DocFlagUtil;

    protected flagSet = new Set<string>([...Object.values(DocFlagKind), "disable"]);

    protected repeatableFlagSet = new Set<string>([
        DocFlagKind.Text
    ]);

    public isDefined(tag: string) {
        return this.flagSet.has(tag);
    }

    public isRepeatable(tag: string) {
        return this.repeatableFlagSet.has(tag);
    }

    public getNormalDefault(): string[] {
        return [DocFlagKind.Text];
    }

    public getFunctionLikeDefault(): string[] {
        return [DocFlagKind.Text, DocFlagKind.Params, DocFlagKind.Returns];
    }

    public getConstructorDefault(): string[] {
        return [DocFlagKind.Text, DocFlagKind.Params];
    }

    public getKeys(node: ASTNode) {

    }
}
