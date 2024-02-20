import {
    DTSComment,
    DTSBlock,
    DTSClass,
    DTSConstructor,
    DTSEnum,
    DTSFunction,
    DTSInterface,
    DTSMethod,
    DTSNamespace,
    DTSParameter,
    DTSProperty,
    DTSRoot,
    DTSType,
    DTSVar,
    DTSCode,
    DTSSourceFile,
} from "./dtsCode";

import {
    ASTNode,
    ASTNodeKind,
    ClassNode,
    EnumNode,
    FunctionNode,
    InterfaceNode,
    NamespaceNode,
    RootNode,
    SourceFileNode,
    VarNode,
} from "../../ast/astNode";
import { TypeParameter } from "../../ast/astType";
import { ASTNodeClassifier, ASTUtil } from "../../util/astUtil";
import { SingletonProperty } from "../../util/classDecorator";
import { Translator } from "../../util/i18n/i18nUtil";
import { Commentable } from "../code";
import { CodeGenerator } from "../generator";

export class TypeParameterUtil {
    @SingletonProperty
    public static readonly instance: TypeParameterUtil;

    public getTypeParametersText(typeParameters?: TypeParameter[]) {
        if (!typeParameters || typeParameters.length == 0)
            return "";
        const texts = typeParameters.map((tp) => {
            if (tp.constraint)
                return `${tp.name} extends ${new DTSType(tp.constraint).renderCode()}`;
            return tp.name;
        });
        return `<${texts.join(", ")}>`;
    }
}

export class DTSGenerator extends CodeGenerator {
    constructor(protected tr: Translator) {
        super();
    }

    protected modifierPriority: { [key: string]: number } = {
        abstract: 1,
        static: 2,
        readonly: 3,
    };

    protected getDTSComment(node: ASTNode): DTSComment {
        return new DTSComment(node, this.tr);
    }

    protected getModifiersText(node: ASTNode): string {
        // TODO async
        const modifiers: string[] = [];
        if (ASTNodeClassifier.instance.isMethodNode(node)) {
            if (node.static)
                modifiers.push("static");
        }
        else if (ASTNodeClassifier.instance.isPropertyNode(node)) {
            if (node.static)
                modifiers.push("static");
            if (node.readonly)
                modifiers.push("readonly");
        }
        else {
            return "";
        }

        return modifiers
            .slice()
            .sort((a, b) => {
                const priorityA = this.modifierPriority[a];
                const priorityB = this.modifierPriority[b];
                return priorityA - priorityB;
            })
            .join(" ");
    }

    protected getTypeParameters(typeParameters?: TypeParameter[]) {
        if (!typeParameters || typeParameters.length == 0)
            return "";
        const texts = typeParameters.map((tp) => {
            if (tp.constraint)
                return `${tp.name} extends ${new DTSType(tp.constraint)}`;
            return tp.name;
        });
        return `<${texts.join(", ")}>`;
    }

    protected getPropertiesAndMethods(node: ClassNode | InterfaceNode): {
        properties: DTSProperty[];
        methods: DTSMethod[];
    } {
        const properties: DTSProperty[] = [];
        const methods: (DTSMethod | DTSConstructor)[] = [];

        for (const property of node.properties)
            properties.push(
                new DTSProperty(
                    {
                        name: property.name,
                        type: new DTSType(property.type),
                        modifiersText: this.getModifiersText(property),
                        isOptional: property.optional,
                    },
                    this.getDTSComment(property),
                ),
            );

        for (const method of node.methods) {
            const parameters: DTSParameter[] = [];
            for (const p of method.parameters)
                parameters.push(new DTSParameter(p.name, new DTSType(p.type)));

            if (method.kind === ASTNodeKind.Constructor) {
                methods.push(
                    new DTSConstructor(parameters, this.getDTSComment(method)),
                );
            }
            else {
                const typeParameterText =
                    TypeParameterUtil.instance.getTypeParametersText(
                        method.typeParameters,
                    );
                methods.push(
                    new DTSMethod(
                        {
                            name: method.name,
                            parameters,
                            returnType: new DTSType(method.returnType),
                            typeParameterText,
                            modifiersText: this.getModifiersText(method),
                        },
                        this.getDTSComment(method),
                    ),
                );
            }
        }
        return { properties, methods };
    }

    public createVar(node: VarNode): DTSVar {
        return new DTSVar({
            name: node.name,
            type: new DTSType(node.type),
            isConst: node.const,
        });
    }

    public createEnum(node: EnumNode): DTSEnum {
        return new DTSEnum(node.name, node.values);
    }

    public createClass(node: ClassNode): DTSClass {
        const { properties, methods } = this.getPropertiesAndMethods(node);
        const typeParameterText =
            TypeParameterUtil.instance.getTypeParametersText(
                node.typeParameters,
            );
        const classExtend = node.extends.map((type) => new DTSType(type));
        const classImplements = node.implements.map(
            (type) => new DTSType(type),
        );
        return new DTSClass(
            {
                name: node.name,
                properties,
                methods,
                typeParameterText,
                extends: classExtend,
            },
            classImplements,
        );
    }

    public createInterface(node: InterfaceNode): DTSInterface {
        const { properties, methods } = this.getPropertiesAndMethods(node);
        const typeParameterText =
            TypeParameterUtil.instance.getTypeParametersText(
                node.typeParameters,
            );
        const interfaceExtends = node.extends.map((type) => new DTSType(type));
        return new DTSInterface({
            name: node.name,
            properties,
            methods,
            typeParameterText,
            extends: interfaceExtends
        });
    }

    public createFunctionCode(node: FunctionNode): DTSFunction {
        const parameters: DTSParameter[] = [];
        for (const parameter of node.parameters)
            parameters.push(
                new DTSParameter(
                    parameter.name,
                    new DTSType(parameter.type),
                    parameter.optional,
                ),
            );
        return new DTSFunction({
            name: node.name,
            parameters,
            returnType: new DTSType(node.returnType),
            typeParameterText: TypeParameterUtil.instance.getTypeParametersText(
                node.typeParameters,
            ),
            modifiersText: this.getModifiersText(node),
        });
    }

    public createNamespaceCode(node: NamespaceNode): DTSNamespace {
        const contents: DTSCode[] = [];
        for (const child of node.children)
            contents.push(this.createCode(child));
        return new DTSNamespace(node.name, contents);
    }

    public createRootCode(node: RootNode): DTSRoot {
        const contents: DTSSourceFile[] = [];
        for (const child of (<RootNode>node).children)
            contents.push(this.craeteSourceFileCode(child));
        return new DTSRoot(contents);
    }

    public craeteSourceFileCode(node: SourceFileNode): DTSSourceFile {
        const contents: DTSCode[] = [];
        for (const child of node.children)
            contents.push(this.createCode(child));
        return new DTSSourceFile(node.name, contents);
    }

    public createCode(node: ASTNode): DTSCode {
        let code: DTSCode;
        switch (node.kind) {
        case ASTNodeKind.Var:
            code = this.createVar(<VarNode>node);
            break;
        case ASTNodeKind.Enum:
            code = this.createEnum(<EnumNode>node);
            break;
        case ASTNodeKind.Function:
            code = this.createFunctionCode(<FunctionNode>node);
            break;
        case ASTNodeKind.Class:
            code = this.createClass(<ClassNode>node);
            break;
        case ASTNodeKind.Interface:
            code = this.createInterface(<InterfaceNode>node);
            break;
        case ASTNodeKind.Namespace:
            code = this.createNamespaceCode(<NamespaceNode>node);
            break;
        case ASTNodeKind.SourceFile:
            code = this.craeteSourceFileCode(<SourceFileNode>node);
            break;
        case ASTNodeKind.Root:
            code = this.createRootCode(<RootNode>node);
            break;
        default:
            throw new Error(
                "can not create node:" +
                        ASTUtil.instance.getString(node, 2),
            );
        }
        if (code instanceof Commentable)
            code.setComment(this.getDTSComment(node));
        return code;
    }

    public getCodeText(node: ASTNode) {
        const code = this.createCode(node);
        return code.renderCode(-1);
    }
}
