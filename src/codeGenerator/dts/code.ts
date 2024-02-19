import { DTSDocUtil } from "./document";
import { TypeParameterUtil } from "./generator";

import { ASTNode } from "../../ast/astNode";
import {
    BasicType,
    BasicTypeNode,
    FunctionTypeNode,
    TypeReferenceNode,
    TypeLiteralNode,
    TypeNode,
    TypeNodeKind,
    UnionTypeNode,
} from "../../ast/astType";
import { Translator } from "../../util/i18nUtil";
import { Code, CodeBlock, CodeUtil, Statement } from "../baseCode";

export type DTSCode = DTSBlock | DTSStatement;

export class DTSComment implements Code {
    protected readonly startText: string = "/**";
    protected readonly endText: string = " */";
    protected readonly prefix: string = " * ";
    protected contents: string[];

    public static getContents(node: ASTNode, tr: Translator): string[] {
        const docRecords = DTSDocUtil.instance.getRecord(node);
        const texts: string[] = [];
        for (const record of docRecords)
            texts.push(`${record.prefix} ${tr.tr(record.key)}`);

        return tr.formatTexts(texts);
    }

    constructor(node: ASTNode, tr: Translator) {
        this.contents = DTSComment.getContents(node, tr);
    }

    public toString(depth?: number): string {
        const texts = this.contents.map((s) => this.prefix + s);
        if (texts.length == 0)
            return "";
        return CodeUtil.instance.arrToLines(
            [this.startText, ...texts, this.endText],
            depth,
            false,
        );
    }
}

export class DTSType implements Code {
    protected typeText: string;

    constructor(type?: TypeNode, typeParameterText: string = "") {
        this.typeText = typeParameterText + this.build(type);
    }

    public buildBasic(type: BasicTypeNode): string {
        switch (type.value) {
        case BasicType.Boolean:
            return "boolean";
        case BasicType.Float:
        case BasicType.Integer:
            return "number";
        case BasicType.String:
            return "string";
        case BasicType.Void:
            return "void";
        case BasicType.Any:
        default:
            return "any";
        }
    }

    public buildFunction(type: FunctionTypeNode): string {
        const parametersText = type.parameters
            .map((p) => this.build(p.type))
            .join(", ");
        const typeParameterText =
            TypeParameterUtil.instance.getTypeParametersText(
                type.typeParameters,
            );
        return `${typeParameterText}(${parametersText}) => ${this.build(type.returnType)}`;
    }

    public buildReference(type: TypeReferenceNode): string {
        const name = type.value;
        if (type.members)
            return `${name}<${type.members.map((t) => this.build(t)).join(", ")}>`;
        return name;
    }

    public buildUnion(type: UnionTypeNode): string {
        return type.value.map((t) => this.build(t)).join(" | ");
    }

    public buildTypeLiteral(type: TypeLiteralNode): string {
        const properties = type.members.map((m) => {
            return `${m.name}: ${this.build(m.type)}`;
        });
        return `{ ${properties.join("; ")} }`;
    }

    public build(type?: TypeNode): string {
        if (!type)
            return "any";
        switch (type.kind) {
        case TypeNodeKind.Basic:
            return this.buildBasic(type);
        case TypeNodeKind.Literal:
            return type.value.toString();
        case TypeNodeKind.Function:
            return this.buildFunction(type);
        case TypeNodeKind.TypeReference:
            return this.buildReference(type);
        case TypeNodeKind.Union:
            return this.buildUnion(type);
        case TypeNodeKind.TypeLiteral:
            return this.buildTypeLiteral(type);
        default:
            return "any";
        }
    }

    public toString(depth?: number | undefined): string {
        return this.typeText;
    }
}

export class DTSStatement extends Statement {
    protected readonly suffix: string = ";";

    constructor(items: string[], comment?: DTSComment) {
        super(items, comment);
    }

    public toString(depth?: number): string {
        const prefix = depth == null || depth <= 0 ? "declare " : "";
        return super.toString(depth, { prefix, suffix: this.suffix });
    }
}

export class DTSCommaStatement extends DTSStatement {
    protected readonly suffix: string = ",";

    constructor(items: string[], comment?: DTSComment) {
        super(items, comment);
    }
}

export class DTSTypedDeclaration extends DTSStatement {
    constructor(prefix: string, type: DTSType) {
        super([prefix + ":", type.toString()]);
    }
}

export class DTSVar extends DTSTypedDeclaration {
    constructor(
        name: string,
        type: DTSType,
        isConst: boolean = false,
        comment?: DTSComment,
    ) {
        super(`${isConst ? "const" : "let"} ${name}`, type);
        this.comment = comment;
    }
}

export class DTSProperty extends DTSTypedDeclaration {
    constructor(name: string, type: DTSType, comment?: DTSComment) {
        super(name, type);
        this.comment = comment;
    }
}

export class DTSParameter implements Code {
    constructor(
        protected name: string,
        protected type: DTSType,
    ) {}

    public toString(depth?: number | undefined): string {
        return `${this.name}: ${this.type.toString()}`;
    }
}

export class DTSConstructor extends DTSStatement {
    constructor(parameters: DTSParameter[], comment?: DTSComment) {
        const parameterText = parameters.map((c) => c.toString()).join(", ");
        super([`constructor(${parameterText})`], comment);
    }
}

export class DTSFunction extends DTSTypedDeclaration {
    constructor(
        name: string,
        parameters: DTSParameter[],
        returnType: DTSType,
        typeParameterText: string,
        comment?: DTSComment,
    ) {
        const parameterText = parameters.map((c) => c.toString()).join(", ");
        super(
            `function ${name}${typeParameterText}(${parameterText})`,
            returnType,
        );
        this.comment = comment;
    }
}

export class DTSMethod extends DTSTypedDeclaration {
    constructor(
        name: string,
        parameters: DTSParameter[],
        returnType: DTSType,
        typeParameterText: string,
        comment?: DTSComment,
    ) {
        const parameterText = parameters.map((c) => c.toString()).join(", ");
        super(`${typeParameterText}${name}(${parameterText})`, returnType);
        this.comment = comment;
    }
}

export class DTSBlock extends CodeBlock {
    protected readonly startText: string = " {";
    protected readonly endText: string = "}";

    constructor(header: Statement, contents: DTSCode[], comment?: DTSComment) {
        super(header, contents, comment);
    }

    public toString(depth?: number | undefined): string {
        const prefix = depth == null || depth <= 0 ? "declare " : "";
        return super.toString(depth, { prefix });
    }
}

export class DTSEnum extends DTSBlock {
    constructor(
        name: string,
        values: { name: string; value: string | number }[],
        comment?: DTSComment,
    ) {
        super(
            new Statement(["enum", name]),
            [
                ...values.map(
                    (v) =>
                        new DTSCommaStatement([
                            v.name,
                            "=",
                            v.value.toString(),
                        ]),
                ),
            ],
            comment,
        );
    }
}

export class DTSClass extends DTSBlock {
    constructor(
        name: string,
        properties: DTSProperty[],
        methods: DTSMethod[],
        typeParameterText: string,
        comment?: DTSComment,
    ) {
        super(
            new Statement(["class", name + typeParameterText]),
            [...properties, ...methods],
            comment,
        );
    }
}

export class DTSInterface extends DTSBlock {
    constructor(
        name: string,
        properties: DTSProperty[],
        methods: DTSMethod[],
        typeParameterText: string,
        comment?: DTSComment,
    ) {
        super(
            new Statement(["interface", name + typeParameterText]),
            [...properties, ...methods],
            comment,
        );
    }
}

export class DTSNamespace extends DTSBlock {
    constructor(name: string, contents: DTSCode[], comment?: DTSComment) {
        super(new Statement(["namespace", name]), contents, comment);
    }
}

export class DTSRoot extends DTSBlock {
    constructor(contents: DTSCode[]) {
        super(new Statement([""]), contents);
    }
}
