import { SingletonProperty } from "../util/classDecorator";

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

    private flagSet = new Set<string>([...Object.values(DocFlagKind), "disable"]);

    private repeatableFlagSet = new Set<string>([
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
}
