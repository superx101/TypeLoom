import { DTSDocUtil } from "./dtsDocument";
import { TypeParameterUtil } from "./dtsGenerator";

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
    ArrayTypeNode,
    TupleTypeNode,
    LiteralTypeNode,
} from "../../ast/astType";
import { Translator } from "../../util/i18n/util";
import { CodeRender, BlockRender, CodeCofig, CodeUtil, StatementRender } from "../code";

export type DTSCode = DTSBlock | DTSStatement;

export interface FunctionLikeDefinition {
    name: string;
    parameters: DTSParameter[];
    returnType: DTSType;
    typeParameterText: string;
    modifiersText: string;
}

export interface ClassLikeDefinition {
    name: string;
    properties: DTSProperty[];
    methods: DTSMethod[];
    typeParameterText: string;
    extends: DTSType[];
}

export class DTSComment implements CodeRender {
    protected readonly startText: string = "/**";
    protected readonly endText: string = " */";
    protected readonly prefix: string = " * ";
    protected contents: string[];

    public static getContents(node: ASTNode, tr: Translator): string[] {
        const docRecords = DTSDocUtil.instance.getRecord(node);
        const texts: string[] = [];
        for (const record of docRecords) {
            const value = tr.tr(record.key);
            if (Array.isArray(value))
                texts.push(`${record.prefix} `, ...value);
            else
                texts.push(`${record.prefix} ${value}`);
        }

        return tr.formatTexts(texts);
    }

    constructor(node: ASTNode, tr: Translator) {
        this.contents = DTSComment.getContents(node, tr);
    }

    public renderCode(depth?: number): string {
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

export class DTSType implements CodeRender {
    protected typeText: string;

    constructor(type?: TypeNode, typeParameterText: string = "") {
        this.typeText = typeParameterText + this.build(type);
    }

    public buildBasic(type: BasicTypeNode): string {
        switch (type.value) {
        case BasicType.dbool:
            return "boolean";
        case BasicType.dfloat:
        case BasicType.dint:
            return "number";
        case BasicType.dstring:
            return "string";
        case BasicType.dvoid:
            return "void";
        case BasicType.dany:
        default:
            return "any";
        }
    }

    public buildFunction(type: FunctionTypeNode): string {
        const parametersText = type.parameters
            .map(
                (p) =>
                    `${p.name}${p.optional ? "?" : ""}: ${this.build(p.type)}`,
            )
            .join(", ");
        const typeParameterText =
            TypeParameterUtil.instance.getTypeParametersText(
                type.typeParameters,
            );
        return `${typeParameterText}(${parametersText}) => ${this.build(type.returnType)}`;
    }

    public buildTypeReference(type: TypeReferenceNode): string {
        const name = type.value;
        if (type.members)
            return `${name}<${type.members.map((t) => this.build(t)).join(", ")}>`;
        return name;
    }

    public buildUnion(type: UnionTypeNode): string {
        return type.elements.map((t) => this.build(t)).join(" | ");
    }

    public buildArray(type: ArrayTypeNode): string {
        return this.build(type.elementType) + "[]";
    }

    public buildTuple(type: TupleTypeNode): string {
        return `[${type.elements.map((t) => this.build(t)).join(", ")}]`;
    }

    public buildTypeLiteral(type: TypeLiteralNode): string {
        const properties = type.members.map((m) => {
            return `${m.name}${m.optional ? "?" : ""}: ${this.build(m.type)}`;
        });
        return `{ ${properties.join("; ")} }`;
    }

    public build(type?: TypeNode): string {
        if (!type)
            return "any";
        switch (type.kind) {
        case TypeNodeKind.Basic:
            return this.buildBasic(<BasicTypeNode>type);
        case TypeNodeKind.Literal:
            return (<LiteralTypeNode>type).value.toString();
        case TypeNodeKind.Function:
            return this.buildFunction(<FunctionTypeNode>type);
        case TypeNodeKind.TypeReference:
            return this.buildTypeReference(<TypeReferenceNode>type);
        case TypeNodeKind.Union:
            return this.buildUnion(<UnionTypeNode>type);
        case TypeNodeKind.Array:
            return this.buildArray(<ArrayTypeNode>type);
        case TypeNodeKind.Tuple:
            return this.buildTuple(<TupleTypeNode>type);
        case TypeNodeKind.TypeLiteral:
            return this.buildTypeLiteral(<TypeLiteralNode>type);
        default:
            return "any";
        }
    }

    public renderCode(depth?: number | undefined): string {
        return this.typeText;
    }
}

export class DTSStatement extends StatementRender {
    protected readonly suffix: string = ";";

    constructor(items: string[], comment?: DTSComment) {
        super(items, comment);
    }

    public renderCode(depth?: number): string {
        const prefix = depth == null || depth <= 0 ? "declare " : "";
        return super.renderCode(depth, { prefix, suffix: this.suffix });
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
        super([prefix + ":", type.renderCode()]);
    }
}

export class DTSVar extends DTSTypedDeclaration {
    constructor(
        definition: {
            name: string;
            type: DTSType;
            isConst: boolean;
        },
        comment?: DTSComment,
    ) {
        super(
            `${definition.isConst ? "const" : "let"} ${definition.name}`,
            definition.type,
        );
        this.comment = comment;
    }
}

export class DTSProperty extends DTSTypedDeclaration {
    constructor(
        definition: {
            name: string;
            type: DTSType;
            modifiersText: string;
            isOptional: boolean;
        },
        comment?: DTSComment,
    ) {
        if (definition.modifiersText !== "")
            definition.modifiersText += " ";
        const optionalText = definition.isOptional ? "?" : "";
        super(
            definition.modifiersText + definition.name + optionalText,
            definition.type,
        );
        this.comment = comment;
    }
}

export class DTSParameter implements CodeRender {
    constructor(
        protected name: string,
        protected type: DTSType,
        protected isOptional: boolean = false,
    ) {}

    public renderCode(depth?: number | undefined): string {
        const optionalText = this.isOptional ? "?" : "";
        return `${this.name}${optionalText}: ${this.type.renderCode()}`;
    }
}

export class DTSConstructor extends DTSStatement {
    constructor(parameters: DTSParameter[], comment?: DTSComment) {
        const parameterText = parameters.map((c) => c.renderCode()).join(", ");
        super([`constructor(${parameterText})`], comment);
    }
}

export class DTSFunction extends DTSTypedDeclaration {
    constructor(definition: FunctionLikeDefinition, comment?: DTSComment) {
        const parameterText = definition.parameters
            .map((c) => c.renderCode())
            .join(", ");
        super(
            `function ${definition.name}${definition.typeParameterText}(${parameterText})`,
            definition.returnType,
        );
        this.comment = comment;
    }
}

export class DTSMethod extends DTSTypedDeclaration {
    constructor(definition: FunctionLikeDefinition, comment?: DTSComment) {
        const parameterText = definition.parameters
            .map((c) => c.renderCode())
            .join(", ");
        if (definition.modifiersText !== "")
            definition.modifiersText += " ";
        super(
            definition.modifiersText +
                definition.name +
                definition.typeParameterText +
                `(${parameterText})`,
            definition.returnType,
        );
        this.comment = comment;
    }
}

export class DTSBlock extends BlockRender {
    protected readonly startText: string = " {";
    protected readonly endText: string = "}";

    constructor(header: StatementRender, contents: DTSCode[], comment?: DTSComment) {
        super(header, contents, comment);
    }

    public renderCode(depth?: number | undefined): string {
        const prefix = depth == null || depth <= 0 ? "declare " : "";
        return super.renderCode(depth, { prefix });
    }
}

export class DTSEnum extends DTSBlock {
    constructor(
        name: string,
        values: { name: string; value: string | number }[],
        comment?: DTSComment,
    ) {
        super(
            new StatementRender(["enum", name]),
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
        definition: ClassLikeDefinition,
        classImplements: DTSType[],
        comment?: DTSComment,
    ) {
        let implementsText = classImplements
            .map((t) => t.renderCode())
            .join(", ");
        let extendText = definition.extends.map((t) => t.renderCode()).join();
        if (implementsText !== "")
            implementsText = "implements " + implementsText;
        if (extendText !== "")
            extendText = "extends " + extendText;

        super(
            new StatementRender([
                "class",
                definition.name + definition.typeParameterText,
                extendText,
                implementsText,
            ]),
            [...definition.properties, ...definition.methods],
            comment,
        );
    }
}

export class DTSInterface extends DTSBlock {
    constructor(definition: ClassLikeDefinition, comment?: DTSComment) {
        let extendsText = definition.extends
            .map((t) => t.renderCode())
            .join(", ");
        if (extendsText !== "")
            extendsText = "extends " + extendsText;

        super(
            new StatementRender([
                "interface",
                definition.name + definition.typeParameterText,
                extendsText,
            ]),
            [...definition.properties, ...definition.methods],
            comment,
        );
    }
}

export class DTSNamespace extends DTSBlock {
    constructor(name: string, contents: DTSCode[], comment?: DTSComment) {
        super(new StatementRender(["namespace", name]), contents, comment);
    }
}

export class DTSSourceFile extends DTSBlock {
    constructor(
        protected fileName: string,
        contents: DTSCode[],
        comment?: DTSComment,
    ) {
        super(new StatementRender([""]), contents, comment);
    }

    public renderCode(_depth?: number | undefined): string {
        if (this.contents.length == 0)
            return "";
        const title = `// file: ${this.fileName}`;
        return (
            CodeCofig.instance.newline +
            title +
            CodeCofig.instance.newline +
            CodeCofig.instance.newline +
            this.contents.map((s) => s.renderCode(0)).join("")
        );
    }
}

export class DTSRoot extends DTSSourceFile {
    constructor(protected contents: DTSSourceFile[]) {
        super("", contents);
    }

    public renderCode(_depth?: number | undefined): string {
        return this.contents.map((s) => s.renderCode(0)).join("");
    }
}
