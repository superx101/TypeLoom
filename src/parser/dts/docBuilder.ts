import { DocFlagUtil, DocFlags } from "../../ast/docFlag";
import { SingletonProperty } from "../../util/classDecorator";

import ts from "typescript";

export class DocFlagParser {
    @SingletonProperty
    public static readonly instance: DocFlagParser;

    protected getPostion(tag: ts.JSDocTag, sourceFile: ts.SourceFile) {
        const fileName = sourceFile.fileName;
        const { line, character } = ts.getLineAndCharacterOfPosition(
            sourceFile,
            tag.pos,
        );
        return `${fileName}:${line}:${character}`;
    }

    public getDocFlagsByNode(
        node: ts.Node,
        sourceFile: ts.SourceFile,
    ): DocFlags {
        const docFlags: DocFlags = { enable: true, flags: [] };
        const jsDocTag = ts.getJSDocTags(node);

        if (ts.isFunctionLike(node))
            docFlags.flags = DocFlagUtil.instance.getFunctionLikeDefault();
        else
            docFlags.flags = DocFlagUtil.instance.getNormalDefault();

        if (!jsDocTag)
            return docFlags;

        for (const tag of jsDocTag) {
            const name = tag.tagName.text;
            if (name === "disable") {
                docFlags.enable = false;
                docFlags.flags = [];
                return docFlags;
            }
            if (!DocFlagUtil.instance.isDefined(name))
                console.warn(
                    `This parser does not allow use '${name}', at ${this.getPostion(tag, sourceFile)}`,
                );
            if (!DocFlagUtil.instance.isRepeatable(name)) {
                docFlags.flags.push(name);
                continue;
            }
            if (!docFlags.flags.includes(name))
                docFlags.flags.push(name);
        }
        return docFlags;
    }
}
