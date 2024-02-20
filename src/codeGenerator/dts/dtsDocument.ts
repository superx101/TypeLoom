import { ASTNode, FunctionLikeNode } from "../../ast/astNode";
import { DocFlagKind, DocFlagUtil, WrongFlagError } from "../../ast/docFlag";
import { ASTNodeClassifier, ASTUtil } from "../../util/astUtil";
import { SingletonProperty } from "../../util/classDecorator";
import { I18nUtil } from "../../util/i18n/i18nUtil";

export type DocRecord = { key: string; prefix: string };

export interface RecordStrategy {
    getRecords(
        node: ASTNode,
        baseKey: string,
        flagName: string,
    ): DocRecord[];
}

export class SimpleRecordStrategy implements RecordStrategy {
    @SingletonProperty
    public static readonly instance: RecordStrategy;

    public getRecords(
        _node: ASTNode,
        baseKey: string,
        flagName: string,
    ): DocRecord[] {
        return [
            {
                key: `${baseKey}.${flagName}`,
                prefix: `@${flagName}`,
            },
        ];
    }
}

export class TextRecordStrategy implements RecordStrategy {
    @SingletonProperty
    public static readonly instance: RecordStrategy;

    public getRecords(
        _node: ASTNode,
        baseKey: string,
        flagName: string,
    ): DocRecord[] {
        return [
            {
                key: `${baseKey}.${flagName}`,
                prefix: "",
            },
        ];
    }
}

export class ExampleRecordStrategy implements RecordStrategy {
    @SingletonProperty
    public static readonly instance: RecordStrategy;

    public getRecords(
        _node: ASTNode,
        baseKey: string,
        _flagName: string,
    ): DocRecord[] {
        return [
            {
                key: `${baseKey}.example.ts`,
                prefix: "@example",
            },
        ];
    }
}

export class ParamRecordStrategy implements RecordStrategy {
    @SingletonProperty
    public static readonly instance: RecordStrategy;

    public getRecords(
        node: ASTNode,
        baseKey: string,
        _flagName: string,
    ): DocRecord[] {
        if (!ASTNodeClassifier.instance.isFunctionLikeNode(node))
            throw new WrongFlagError(
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

export class ReturnRecordStrategy extends SimpleRecordStrategy {
    @SingletonProperty
    public static readonly instance: RecordStrategy;

    public getRecords(
        node: ASTNode,
        baseKey: string,
        _flagName: string,
    ): DocRecord[] {
        if (!ASTNodeClassifier.instance.isFunctionLikeNode(node))
            throw new WrongFlagError(
                `'${node.name}' is not functionLikeNode, do not allow use 'returns' tag`,
            );
        return super.getRecords(node, baseKey, DocFlagKind.Returns);
    }
}

export class DTSDocUtil {
    @SingletonProperty
    public static readonly instance: DTSDocUtil;

    protected tagsMap: Map<string, RecordStrategy> = new Map([
        [DocFlagKind.Deprecated, SimpleRecordStrategy.instance],
        [DocFlagKind.Text, TextRecordStrategy.instance],
        [DocFlagKind.Example, ExampleRecordStrategy.instance],
        [DocFlagKind.Params, ParamRecordStrategy.instance],
        [DocFlagKind.Returns, ReturnRecordStrategy.instance],
    ]);

    public getRecord(node: ASTNode): DocRecord[] {
        const records: DocRecord[] = [];
        const baseKey = I18nUtil.instance.getKeyByNode(node);
        if (node.docFlags == null || !node.docFlags.enable)
            return records;

        const visitedCountMap = new Map<string, number>();

        for (const tag of node.docFlags.flags) {
            const strategy = this.tagsMap.get(tag);
            const index = visitedCountMap.get(tag) || 0;
            const name = DocFlagUtil.instance.isRepeatable(tag) ? tag + index : tag;
            try {
                if (strategy)
                    records.push(...strategy.getRecords(node, baseKey, name));
                else
                    records.push(
                        ...SimpleRecordStrategy.instance.getRecords(
                            node,
                            baseKey,
                            name,
                        ),
                    );
            }
            catch (err: unknown) {
                if (err instanceof WrongFlagError)
                    console.warn(err.message);
                else
                    throw err;
            }
            visitedCountMap.set(tag, index + 1);
        }
        return records;
    }
}
