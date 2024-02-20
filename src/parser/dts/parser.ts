
import { ASTNodeBuilder } from "./builder";

import { ASTNode, ASTNodeKind, RootNode } from "../../ast/astNode";
import { ASTUtil } from "../../util/astUtil";

import ts from "typescript";

import * as fs from "fs";
import path from "path";

export class DTSParser {
    private compilerOptions: ts.CompilerOptions;

    constructor(compilerOptions: ts.CompilerOptions) {
        this.compilerOptions = compilerOptions;
    }

    protected getReferences(
        fileName: string,
        allReferences: Set<string> = new Set(),
    ): void {
        const fileContent = fs.readFileSync(fileName, "utf-8");
        const referenceRegEx = /\/\/\/\s*<reference\s+path="(.+)"\s*\/>/g;
        let match: RegExpExecArray | null;

        const dirName = path.dirname(fileName);

        while ((match = referenceRegEx.exec(fileContent)) !== null)
            if (match[1]) {
                const referencePath = path.resolve(dirName, match[1]);

                if (!allReferences.has(referencePath)) {
                    allReferences.add(referencePath);
                    this.getReferences(referencePath, allReferences);
                }
            }

    }

    public parse(mainFilePath: string): RootNode {
        const mainPath = path.resolve(mainFilePath);
        const references = new Set<string>();

        references.add(mainPath);
        this.getReferences(mainFilePath, references);

        const files = Array.from(references);
        files.sort();

        const program = ts.createProgram(files, this.compilerOptions);
        program.getTypeChecker();

        // build AST file by file
        const root: RootNode = {
            kind: ASTNodeKind.Root,
            name: "",
            children: [],
        };
        files.forEach((v) => {
            const sourceFile = program.getSourceFile(v);
            if (!sourceFile) {
                console.error("Cannot get source file", v);
                return;
            }
            const visitor = new ASTNodeBuilder(sourceFile, mainPath);
            root.children.push(visitor.buildSourceFile(sourceFile));
        });
        ASTUtil.instance.makeParent(root);
        return root;
    }
}
