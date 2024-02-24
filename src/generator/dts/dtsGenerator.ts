import {
    DTSComment,
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


import { Commentable } from "../code";
import { generator } from "../generator";

import { TypeParameter } from "src/ast";
import {
    ASTNode,
    ASTNodeKind,
    ClassNode,
    EnumNode,
    FunctionNode,
    InterfaceNode,
    MethodNode,
    ModifierKind,
    NamespaceNode,
    PropertyNode,
    RootNode,
    SourceFileNode,
    VarNode,
} from "src/ast/astNode";
import { Translator } from "src/i18n";
import { ASTUtil } from "src/util/astUtil";
import { SingletonProperty } from "src/util/classDecorator";

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


export class DTSGenerator extends generator {
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
        if (node instanceof MethodNode || node instanceof PropertyNode)
            modifiers.push(
                ...node.modifier.map((m) => ModifierKind[m].toLowerCase()),
            );
        else
            return "";

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
                        isOptional: property.isOptional,
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

    public renderVar(node: VarNode): DTSVar {
        return new DTSVar({
            name: node.name,
            type: new DTSType(node.type),
            isConst: node.isConst,
        });
    }

    public renderEnum(node: EnumNode): DTSEnum {
        return new DTSEnum(node.name, node.values);
    }

    public renderClass(node: ClassNode): DTSClass {
        const { properties, methods } = this.getPropertiesAndMethods(node);
        const typeParameterText =
            TypeParameterUtil.instance.getTypeParametersText(
                node.typeParameters,
            );
        const classExtend = node.extends.map((type) => new DTSType(type));
        const classImplements = node.classImplements.map(
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

    public renderInterface(node: InterfaceNode): DTSInterface {
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
            extends: interfaceExtends,
        });
    }

    public renderFunctionCode(node: FunctionNode): DTSFunction {
        const parameters: DTSParameter[] = [];
        for (const parameter of node.parameters)
            parameters.push(
                new DTSParameter(
                    parameter.name,
                    new DTSType(parameter.type),
                    parameter.isOptional,
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

    public renderNamespaceCode(node: NamespaceNode): DTSNamespace {
        const contents: DTSCode[] = [];
        for (const child of node.children)
            contents.push(this.renderCode(child));
        return new DTSNamespace(node.name, contents);
    }

    public renderRootCode(node: RootNode): DTSRoot {
        const contents: DTSSourceFile[] = [];
        for (const child of (<RootNode>node).children)
            contents.push(this.renderSourceFileCode(<SourceFileNode>child));
        return new DTSRoot(contents);
    }

    public renderSourceFileCode(node: SourceFileNode): DTSSourceFile {
        const contents: DTSCode[] = [];
        for (const child of node.children)
            contents.push(this.renderCode(child));
        return new DTSSourceFile(node.name, contents);
    }

    public renderCode(node: ASTNode): DTSCode {
        let code: DTSCode;
        switch (node.kind) {
        case ASTNodeKind.Var:
            code = this.renderVar(<VarNode>node);
            break;
        case ASTNodeKind.Enum:
            code = this.renderEnum(<EnumNode>node);
            break;
        case ASTNodeKind.Function:
            code = this.renderFunctionCode(<FunctionNode>node);
            break;
        case ASTNodeKind.Class:
            code = this.renderClass(<ClassNode>node);
            break;
        case ASTNodeKind.Interface:
            code = this.renderInterface(<InterfaceNode>node);
            break;
        case ASTNodeKind.Namespace:
            code = this.renderNamespaceCode(<NamespaceNode>node);
            break;
        case ASTNodeKind.SourceFile:
            code = this.renderSourceFileCode(<SourceFileNode>node);
            break;
        case ASTNodeKind.Root:
            code = this.renderRootCode(<RootNode>node);
            break;
        default:
            throw new Error(
                "can not render node:" +
                        ASTUtil.instance.getString(node, 2),
            );
        }
        if (code instanceof Commentable)
            code.setComment(this.getDTSComment(node));
        return code;
    }

    public renderCodeText(node: ASTNode) {
        const code = this.renderCode(node);
        return code.renderCode(-1);
    }
}
