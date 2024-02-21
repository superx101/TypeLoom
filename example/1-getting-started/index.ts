import { ASTUtil, ConsoleUtil } from "../../src";
import { DTSParser, DTSGenerator } from "../../src/dts";
import { Translator, LanguageCode, I18nUtil } from "../../src/i18n";

import ts from "typescript";

import * as fs from "fs";

// not related to this example, only setting colors for the console
ConsoleUtil.instance.setColorfulConsole();


// set parser options
const parser = new DTSParser({
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
});

const sourceFilePath = "./source.d.ts";
const astJsonText = "./output/ast-json.json";
const langFilePath = "./output/some-lang.json";
const outputPath = "./output/out.d.ts";

// create AST from sourceFilePath
const ast = parser.parse(sourceFilePath);

// get AST json text
fs.writeFileSync(astJsonText, ASTUtil.instance.getString(ast, 2));
console.info("Generated ast json file to", astJsonText);

// auto generate a language map file by AST
const langMap = I18nUtil.instance.createKeyMaps(ast);
fs.writeFileSync(langFilePath, JSON.stringify(langMap, null, 4));
console.info("Generated lang file to", langFilePath);

// generate d.ts code from AST
const generator = new DTSGenerator(new Translator(langMap, LanguageCode.en_us));
const codeText = generator.getCodeText(ast);
fs.writeFileSync(outputPath, codeText);
console.info("Generated typescript output file to", outputPath);
