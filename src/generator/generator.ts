import {
    ASTNode,
} from "../ast/astNode";
import { Translator } from "../util/i18n/util";

export abstract class generator {
    protected abstract tr: Translator;
    public abstract renderCodeText(node: ASTNode): string;
}
