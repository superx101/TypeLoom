import { DTSGenerator } from "./codeGenerator/dts/dtsGenerator";
import { DTSParser } from "./parser/dts/parser";
import { ASTUtil } from "./util/astUtil";
import { I18nUtil, LanguageCode, Translator } from "./util/i18n/i18nUtil";

import colors from "colors";
import ts from "typescript";

import * as fs from "fs";
import path from "path";

function setConsole() {
    function logConstructor(colorFn: (text: string) => string) {
        return (...data: any[]) => {
            process.stderr.write(colorFn(Array.from(data).join(" ")) + "\n");
        };
    }

    console.error = logConstructor(colors.red);
    console.warn = logConstructor(colors.yellow);
    console.info = logConstructor(colors.green);
}

function main() {
    const parser = new DTSParser({
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
    });

    const sourceFilePath = "../example/test2.d.ts";
    const astJsonText = "../example/ast-json.json";
    const langFilePath = "../example/some-lang.json";
    const outputPath = "../example/output/out.d.ts";

    const ast = parser.parse(sourceFilePath);
    fs.writeFileSync(
        astJsonText,
        ASTUtil.instance.getString(ast, 2),
    );
    console.info("Generated ast json file to", astJsonText);

    const langMap = I18nUtil.instance.createKeyMaps(ast);
    fs.writeFileSync(
        langFilePath,
        JSON.stringify(langMap, null, 4),
    );
    console.info("Generated lang file to", langFilePath);

    const generator = new DTSGenerator(
        new Translator(langMap, LanguageCode.en_us),
    );
    const codeText = generator.getCodeText(ast);
    fs.writeFileSync(outputPath, codeText);
    console.info("Generated typescript output file to", outputPath);
}

setConsole();
main();