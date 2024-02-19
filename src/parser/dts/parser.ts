import { ASTNodeBuilder } from "./builder";

import { ASTNode } from "../../ast/astNode";
import { ASTUtil } from "../../util/astUtil";

import ts from "typescript";

import * as fs from "fs";

export class DTSParser {
    private compilerOptions: ts.CompilerOptions;

    constructor(compilerOptions: ts.CompilerOptions) {
        this.compilerOptions = compilerOptions;
    }

    protected getReferences(fileName: string): string[] {
        const references: string[] = [];
        const fileContent = fs.readFileSync(fileName, "utf-8");
        const referenceRegEx = /\/\/\/\s*<reference\s+path="(.+)"\s*\/>/g;
        let match: RegExpExecArray | null;
        while ((match = referenceRegEx.exec(fileContent)) !== null)
            if (match[1])
                references.push(match[1]);


        return references;
    }

    public parse(mainFile: string): ASTNode {
        const references = this.getReferences(mainFile);
        const program = ts.createProgram([mainFile, ...references], this.compilerOptions);

        const sourceFile = program.getSourceFile(mainFile);
        if (!sourceFile)
            throw new Error();

        // Need Help: unknown reason, not using getTypeChecker, node will missing information
        program.getTypeChecker();

        const visitor = new ASTNodeBuilder(sourceFile);
        const ast = visitor.buildAST(sourceFile)!;
        ASTUtil.instance.makeParent(ast);
        return ast;
    }
}