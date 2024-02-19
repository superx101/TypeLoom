import { DTSGenerator } from "./codeGenerator/dts/generator";
import { DTSParser } from "./parser/dts/parser";
import { ASTUtil } from "./util/astUtil";
import { Translator } from "./util/i18nUtil";
import { USHandleStrategy } from "./util/i18nUtils/enHandleStrategy";

import ts from "typescript";

import * as fs from "fs";

function main() {
    const parser = new DTSParser({
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS
    });

    const ast = parser.parse("../example/test.d.ts");
    fs.writeFileSync("../example/test.json", ASTUtil.instance.toString(ast, 2));
    console.log("../example/test.json");

    const generator = new DTSGenerator(new Translator({}, new USHandleStrategy()));
    const codeText = generator.getCodeText(ast);
    fs.writeFileSync("../example/output/test-out.d.ts", codeText);
    console.log("../example/output/test-out.d.ts");
}

main();