import {
    ASTNode,
} from "../ast/astNode";
import { Translator } from "../util/i18nUtil";

export abstract class CodeGenerator {
    protected abstract tr: Translator;
    public abstract getCodeText(node: ASTNode): string;
}
