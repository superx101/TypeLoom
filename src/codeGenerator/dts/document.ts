import { ASTNode, FunctionLikeNode } from "../../ast/astNode";
import { DocFlagKind } from "../../ast/docFlag";
import { ASTUtil } from "../../util/astUtil";
import { SingletonProperty } from "../../util/classDecorator";
import { I18nUtil } from "../../util/i18nUtil";

export type DocRecord = { key: string; prefix: string };

export interface FlagStrategy {
    getRecords(node: ASTNode, baseKey: string, tagName: string): DocRecord[];
}

export class WrongTagError extends Error {}

export class SimpleFlagStrategy implements FlagStrategy {
    @SingletonProperty
    public static readonly instance: FlagStrategy;

    public getRecords(
        _node: ASTNode,
        baseKey: string,
        tagName: string,
    ): DocRecord[] {
        return [
            {
                key: `${baseKey}.${tagName}`,
                prefix: `@${tagName}`,
            },
        ];
    }
}

export class TextFlagStrategy implements FlagStrategy {
    @SingletonProperty
    public static readonly instance: FlagStrategy;

    public getRecords(
        _node: ASTNode,
        baseKey: string,
        _tagName: string,
    ): DocRecord[] {
        return [
            {
                key: `${baseKey}.text`,
                prefix: "",
            },
        ];
    }
}

export class ExampleFlagStrategy implements FlagStrategy {
    @SingletonProperty
    public static readonly instance: FlagStrategy;

    public getRecords(_node: ASTNode, baseKey: string, tagName: string): DocRecord[] {
        return [
            {
                key: `${baseKey}.${tagName}.ts`,
                prefix: `@${tagName}`,
            },
        ];
    }
}

export class ParamFlagStrategy implements FlagStrategy {
    @SingletonProperty
    public static readonly instance: FlagStrategy;

    public getRecords(
        node: ASTNode,
        baseKey: string,
        _tagName: string,
    ): DocRecord[] {
        if (!ASTUtil.instance.isFunctionLikeNode(node))
            throw new WrongTagError(
                `'${node.name}' is not functionLikeNode, do not allow use 'params' tag`,
            );
        return node.parameters.map((param) => {
            return {
                key: `${baseKey}.param.${param.name}`,
                prefix: `@param ${param.name}`,
            };
        });
    }
}

export class ReturnFlagStrategy extends SimpleFlagStrategy {
    @SingletonProperty
    public static readonly instance: FlagStrategy;

    public getRecords(
        node: ASTNode,
        baseKey: string,
        _tagName: string,
    ): DocRecord[] {
        if (!ASTUtil.instance.isFunctionLikeNode(node))
            throw new WrongTagError(
                `'${node.name}' is not functionLikeNode, do not allow use 'returns' tag`,
            );
        return super.getRecords(node, baseKey, DocFlagKind.Returns);
    }
}

export class DTSDocUtil {
    @SingletonProperty
    public static readonly instance: DTSDocUtil;

    protected tagsMap: Map<string, FlagStrategy> = new Map([
        [DocFlagKind.Deprecated, SimpleFlagStrategy.instance],
        [DocFlagKind.Text, TextFlagStrategy.instance],
        [DocFlagKind.Example, ExampleFlagStrategy.instance],
        [DocFlagKind.Params, ParamFlagStrategy.instance],
        [DocFlagKind.Returns, ReturnFlagStrategy.instance],
    ]);

    public getRecord(node: ASTNode): DocRecord[] {
        const records: DocRecord[] = [];
        const baseKey = I18nUtil.instance.getKeyByNode(node);
        if (node.docFlags == null || !node.docFlags.enable)
            return records;

        for (const tag of node.docFlags.flags) {
            const strategy = this.tagsMap.get(tag);
            try {
                if (strategy)
                    records.push(...strategy.getRecords(node, baseKey, tag));
                else
                    records.push(
                        ...SimpleFlagStrategy.instance.getRecords(
                            node,
                            baseKey,
                            tag,
                        ),
                    );
            }
            catch (err: unknown) {
                if (err instanceof WrongTagError)
                    console.warn(err.message);
                else
                    throw err;
            }
        }
        return records;
    }
}
