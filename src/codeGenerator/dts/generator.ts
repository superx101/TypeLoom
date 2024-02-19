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
} from "./code";

import {
    ASTNode,
    ASTNodeKind,
    ClassNode,
    EnumNode,
    FunctionNode,
    InterfaceNode,
    MethodNode,
    NamespaceNode,
    RootNode,
    VarNode,
} from "../../ast/astNode";
import { TypeParameter } from "../../ast/astType";
import { SingletonProperty } from "../../util/classDecorator";
import { Translator } from "../../util/i18nUtil";
import { Code, Commentable, Statement } from "../baseCode";
import { CodeGenerator } from "../baseGenerator";

export class TypeParameterUtil {
    @SingletonProperty
    public static readonly instance: TypeParameterUtil;

    public getTypeParametersText(typeParameters?: TypeParameter[]) {
        if (!typeParameters || typeParameters.length == 0)
            return "";
        const texts = typeParameters.map((tp) => {
            if (tp.constraint)
                return `${tp.name} extends ${new DTSType(tp.constraint)}`;
            return tp.name;
        });
        return `<${texts.join(", ")}>`;
    }
}

export class DTSGenerator extends CodeGenerator {
    constructor(protected tr: Translator) {
        super();
    }

    public getTypeParameters(typeParameters?: TypeParameter[]) {
        if (!typeParameters || typeParameters.length == 0)
            return "";
        const texts = typeParameters.map((tp) => {
            if (tp.constraint)
                return `${tp.name} extends ${new DTSType(tp.constraint)}`;
            return tp.name;
        });
        return `<${texts.join(", ")}>`;
    }

    protected getDTSComment(node: ASTNode) {
        return new DTSComment(node, this.tr);
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
                    property.name,
                    new DTSType(property.type),
                    this.getDTSComment(property),
                ),
            );

        for (const method of node.methods) {
            const parameters: DTSParameter[] = [];
            for (const p of method.parameters)
                parameters.push(new DTSParameter(p.name, new DTSType(p.type)));
            if (method.kind === ASTNodeKind.Constructor)
                methods.push(
                    new DTSConstructor(parameters, this.getDTSComment(method)),
                );
            else
                methods.push(
                    new DTSMethod(
                        method.name,
                        parameters,
                        new DTSType(method.returnType),
                        TypeParameterUtil.instance.getTypeParametersText(
                            method.typeParameters,
                        ),
                        this.getDTSComment(method),
                    ),
                );
        }
        return { properties, methods };
    }

    public createVar(node: VarNode): DTSVar {
        return new DTSVar(node.name, new DTSType(node.type), node.const);
    }

    public createEnum(node: EnumNode): DTSEnum {
        return new DTSEnum(node.name, node.values);
    }

    public createClass(node: ClassNode): DTSClass {
        const { properties, methods } = this.getPropertiesAndMethods(node);
        return new DTSClass(
            node.name,
            properties,
            methods,
            TypeParameterUtil.instance.getTypeParametersText(
                node.typeParameters,
            ),
        );
    }

    public createInterface(node: InterfaceNode): DTSInterface {
        const { properties, methods } = this.getPropertiesAndMethods(node);
        return new DTSInterface(
            node.name,
            properties,
            methods,
            TypeParameterUtil.instance.getTypeParametersText(
                node.typeParameters,
            ),
        );
    }

    public createFunctionCode(node: FunctionNode): DTSFunction {
        const parameters: DTSParameter[] = [];
        for (const parameter of node.parameters)
            parameters.push(
                new DTSParameter(parameter.name, new DTSType(parameter.type)),
            );
        return new DTSFunction(
            node.name,
            parameters,
            new DTSType(node.returnType),
            TypeParameterUtil.instance.getTypeParametersText(
                node.typeParameters,
            ),
        );
    }

    public createNamespaceCode(node: NamespaceNode): DTSNamespace {
        const contents: DTSCode[] = [];
        for (const child of node.children)
            contents.push(this.createCode(child));
        return new DTSNamespace(node.name, contents);
    }

    public createRootCode(node: RootNode): DTSBlock {
        const contents: DTSCode[] = [];
        for (const child of (<RootNode>node).children)
            contents.push(this.createCode(child));
        return new DTSRoot(contents);
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
        case ASTNodeKind.Root:
            code = this.createRootCode(<RootNode>node);
            break;
        default:
            throw new Error("TODO");
        }
        if (code instanceof Commentable)
            code.setComment(this.getDTSComment(node));
        return code;
    }

    public getCodeText(node: ASTNode) {
        const code = this.createCode(node);
        return code.toString(-1);
    }
}
