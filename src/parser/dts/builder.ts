import { DocFlagParser } from "./docBuilder";

import {
    ASTNode,
    ASTNodeKind,
    ClassNode,
    ConstructorNode,
    EnumNode,
    FunctionNode,
    InterfaceNode,
    MethodNode,
    NamespaceNode,
    ParameterNode,
    PropertyNode,
    RootNode,
    VarNode,
} from "../../ast/astNode";
import {
    BasicType,
    BasicTypeNode,
    TypeReferenceNode,
    TypeNode,
    TypeNodeKind,
    UnionTypeNode,
    FunctionTypeNode,
    ParameterType,
    TypeLiteralNode,
    LiteralTypeNode,
    TypeParameter,
    ArrayTypeNode,
    TupleTypeNode,
} from "../../ast/astType";
import { DocFlags } from "../../ast/docFlag";
import { ASTNodeClassifier, ASTUtil } from "../../util/astUtil";
import { SingletonProperty } from "../../util/classDecorator";

import ts from "typescript";

export class TypeParameterBuilder {
    @SingletonProperty
    public static instance: TypeParameterBuilder;

    public buildTypeParameters(
        typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>,
    ): TypeParameter[] | undefined {
        return typeParameters?.map((typeParameter) => {
            const constraint =
                typeParameter.constraint &&
                ts.isTypeReferenceNode(typeParameter.constraint)
                    ? <TypeReferenceNode>(
                          TypeBuilder.instance.buildTypeReference(
                              typeParameter.constraint,
                          )
                      )
                    : undefined;
            return {
                name: typeParameter.name.getText(),
                constraint,
            };
        });
    }
}

export class TypeBuilder {
    @SingletonProperty
    public static readonly instance: TypeBuilder;

    private readonly typeSet: Set<string>;

    constructor() {
        const set = new Set<string>();
        for (const key in BasicType)
            set.add(BasicType[key]);

        this.typeSet = set;
    }

    public getParameters(node: ts.ParameterDeclaration): ParameterType {
        return {
            name: node.name.getText(),
            type: this.build(node.type!),
            optional: !!node.questionToken,
        };
    }

    public buildLiteralType(node: ts.LiteralTypeNode): LiteralTypeNode {
        return {
            kind: TypeNodeKind.Literal,
            value: node.literal.getText(),
        };
    }

    public buildFunction(node: ts.FunctionTypeNode): FunctionTypeNode {
        return {
            kind: TypeNodeKind.Function,
            parameters: node.parameters.map((parameter) =>
                this.getParameters(parameter),
            ),
            typeParameters: TypeParameterBuilder.instance.buildTypeParameters(
                node.typeParameters,
            ),
            returnType: this.build(node.type),
        };
    }

    public buildTypeReference(
        node: ts.TypeReferenceNode,
    ): BasicTypeNode | TypeReferenceNode {
        const text = node.getText();
        if (this.typeSet.has(text))
            return {
                kind: TypeNodeKind.Basic,
                value: BasicType[text as keyof typeof BasicType],
            };

        return {
            kind: TypeNodeKind.TypeReference,
            members: node.typeArguments?.map((type) => this.build(type)),
            value: node.typeName.getText(),
        };
    }

    public buildUnion(node: ts.UnionTypeNode): UnionTypeNode {
        return {
            kind: TypeNodeKind.Union,
            value: node.types.map(
                (type) =>
                    <Exclude<TypeNode, UnionTypeNode>>(
                        this.build(<ts.TypeNode>type)
                    ),
            ),
        };
    }

    public buildArray(node: ts.ArrayTypeNode): ArrayTypeNode {
        return {
            kind: TypeNodeKind.Array,
            elementType: this.build(node.elementType),
        };
    }

    public buildTuple(node: ts.TupleTypeNode): TupleTypeNode {
        return {
            kind: TypeNodeKind.Tuple,
            elements: node.elements.map((type) => this.build(type)),
        };
    }

    public buildTypeLiteral(node: ts.TypeLiteralNode): TypeLiteralNode {
        return {
            kind: TypeNodeKind.TypeLiteral,
            members: node.members.map((member) => {
                return {
                    name: member.name!.getText(),
                    type: this.build((<ts.PropertySignature>member).type!),
                    optional: !!(<ts.PropertySignature>member).questionToken,
                };
            }),
        };
    }

    public build(node: ts.TypeNode): TypeNode {
        switch (node.kind) {
        case ts.SyntaxKind.TypeReference:
            return this.buildTypeReference(<ts.TypeReferenceNode>node);
        case ts.SyntaxKind.UnionType:
            return this.buildUnion(<ts.UnionTypeNode>node);
        case ts.SyntaxKind.FunctionType:
            return this.buildFunction(<ts.FunctionTypeNode>node);
        case ts.SyntaxKind.TypeLiteral:
            return this.buildTypeLiteral(<ts.TypeLiteralNode>node);
        case ts.SyntaxKind.ArrayType:
            return this.buildArray(<ts.ArrayTypeNode>node);
        case ts.SyntaxKind.TupleType:
            return this.buildTuple(<ts.TupleTypeNode>node);
        case ts.SyntaxKind.LiteralType:
            return this.buildLiteralType(<ts.LiteralTypeNode>node);
        default:
            throw new Error(
                `Unknown type kind: [${node.kind}] ${ts.SyntaxKind[node.kind]}. Kind: ${node.getText()}`,
            );
        }
    }
}

export class ASTNodeBuilder {
    constructor(private sourceFile: ts.SourceFile) {}

    public getModelLikeChildren(statements: ts.NodeArray<ts.Statement>) {
        const children: ASTNode[] = [];
        statements.forEach((statement) => {
            const child = this.build(statement);
            if (child)
                if (Array.isArray(child))
                    children.push(...child);
                else
                    children.push(child);
        });
        return children;
    }

    public buildBase<D extends DocFlags>(
        node: ts.NamedDeclaration,
        hasDoc: boolean = true,
    ): Omit<ASTNode, "kind" | "docOptions"> & { docFlags: D | undefined } {
        return {
            name: node.name!.getText(),
            docFlags: hasDoc
                ? <D>(
                      DocFlagParser.instance.getDocFlagsByNode(
                          node,
                          this.sourceFile,
                      )
                  )
                : undefined,
        };
    }

    public buildEnum(node: ts.EnumDeclaration): EnumNode {
        const values = node.members.map((member, index) => {
            return {
                name: member.name.getText(this.sourceFile),
                value: member.initializer?.getText(this.sourceFile) || index,
            };
        });
        return {
            kind: ASTNodeKind.Enum,
            ...this.buildBase(node),
            values,
        };
    }

    public buildVars(node: ts.VariableStatement): VarNode[] {
        // Need Help: How to distinguish const,var,let ???
        const isConst = (node.declarationList.flags as any) === 33554434;
        return node.declarationList.declarations.map((declaration) => {
            return {
                kind: ASTNodeKind.Var,
                ...this.buildBase(declaration),
                const: isConst,
                type: TypeBuilder.instance.build(declaration.type!),
            };
        });
    }

    public buildParam(node: ts.ParameterDeclaration): ParameterNode {
        return {
            kind: ASTNodeKind.Param,
            ...this.buildBase(node, false),
            type: TypeBuilder.instance.build(node.type!),
            optional: node.questionToken != null,
        };
    }

    public buildProperty(
        node: ts.PropertyDeclaration | ts.PropertySignature,
    ): PropertyNode {
        return {
            kind: ASTNodeKind.Property,
            ...this.buildBase(node),
            type: TypeBuilder.instance.build(node.type!),
            static:
                node.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword,
                ) || false,
            readonly:
                node.modifiers?.some(
                    (modifier) =>
                        modifier.kind === ts.SyntaxKind.ReadonlyKeyword,
                ) || false,
            optional: node.questionToken != null,
        };
    }

    public buildFunctionLike(
        node:
            | ts.FunctionLikeDeclaration
            | ts.FunctionOrConstructorTypeNode
            | ts.MethodSignature,
    ) {
        return {
            typeParameters: TypeParameterBuilder.instance.buildTypeParameters(
                node.typeParameters,
            ),
            parameters: node.parameters.map((parameter) =>
                this.buildParam(<ts.ParameterDeclaration>parameter),
            ),
            returnType: TypeBuilder.instance.build(node.type!),
        };
    }

    public buildFunction(node: ts.FunctionDeclaration): FunctionNode {
        return {
            kind: ASTNodeKind.Function,
            ...this.buildBase(node),
            ...this.buildFunctionLike(node),
            async:
                node.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
                ) || false,
        };
    }

    public buildMethod(
        node: ts.MethodDeclaration | ts.MethodSignature,
    ): MethodNode {
        return {
            kind: ASTNodeKind.Method,
            ...this.buildBase(node),
            ...this.buildFunctionLike(node),
            static:
                node.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword,
                ) || false,
            async:
                node.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
                ) || false,
        };
    }

    public buildClass(node: ts.ClassDeclaration): ClassNode {
        // TODO:继承 and impl
        const properties: PropertyNode[] = [];
        const methods: (MethodNode | ConstructorNode)[] = [];

        node.members.forEach((member) => {
            switch (member.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                properties.push(
                    this.buildProperty(<ts.PropertyDeclaration>member),
                );
                break;
            case ts.SyntaxKind.MethodDeclaration:
                methods.push(
                    this.buildMethod(<ts.MethodDeclaration>member),
                );
                break;
            case ts.SyntaxKind.Constructor:
                methods.push({
                    kind: ASTNodeKind.Constructor,
                    name: "constructor",
                    docFlags: DocFlagParser.instance.getDocFlagsByNode(
                        member,
                        this.sourceFile,
                    ),
                    parameters: (<ts.ConstructorDeclaration>(
                            member
                        )).parameters.map((parameter) =>
                        this.buildParam(<ts.ParameterDeclaration>parameter),
                    ),
                });
            }
        });
        return {
            kind: ASTNodeKind.Class,
            ...this.buildBase(node),
            typeParameters: TypeParameterBuilder.instance.buildTypeParameters(
                node.typeParameters,
            ),
            properties,
            methods,
        };
    }

    public buildInterface(node: ts.InterfaceDeclaration): InterfaceNode {
        const properties: PropertyNode[] = [];
        const methods: MethodNode[] = [];

        node.members.forEach((member) => {
            if (ts.isPropertySignature(member))
                properties.push(this.buildProperty(member));
            else if (ts.isMethodSignature(member))
                methods.push(this.buildMethod(member));
        });

        return {
            kind: ASTNodeKind.Interface,
            ...this.buildBase(node),
            typeParameters: TypeParameterBuilder.instance.buildTypeParameters(
                node.typeParameters,
            ),
            properties,
            methods,
        };
    }

    public buildNamespace(node: ts.NamespaceDeclaration): NamespaceNode {
        return {
            kind: ASTNodeKind.Namespace,
            name: node.name.getText(this.sourceFile),
            docFlags: DocFlagParser.instance.getDocFlagsByNode(
                node,
                this.sourceFile,
            ),
            children: this.getModelLikeChildren(
                (<ts.ModuleBlock>node.body).statements,
            ),
        };
    }

    public buildRoot(node: ts.SourceFile): RootNode {
        return {
            kind: ASTNodeKind.Root,
            name: "",
            children: this.getModelLikeChildren(node.statements),
        };
    }

    public build(node: ts.Node): ASTNode | ASTNode[] | null {
        switch (node.kind) {
        case ts.SyntaxKind.VariableStatement:
            return this.buildVars(<ts.VariableStatement>node);
        case ts.SyntaxKind.EnumDeclaration:
            return this.buildEnum(<ts.EnumDeclaration>node);
        case ts.SyntaxKind.FunctionDeclaration:
            return this.buildFunction(<ts.FunctionDeclaration>node);
        case ts.SyntaxKind.ClassDeclaration:
            return this.buildClass(<ts.ClassDeclaration>node);
        case ts.SyntaxKind.InterfaceDeclaration:
            return this.buildInterface(<ts.InterfaceDeclaration>node);
        case ts.SyntaxKind.ModuleDeclaration:
            return this.buildNamespace(<ts.NamespaceDeclaration>node);
        case ts.SyntaxKind.SourceFile:
            return this.buildRoot(<ts.SourceFile>node);
        case ts.SyntaxKind.TypeAliasDeclaration:
        case ts.SyntaxKind.EndOfFileToken:
            return null;
        default:
            throw new Error(
                `Unknown node kind: [${node.kind}] ${ts.SyntaxKind[node.kind]}. Node: ${node.getText()}`,
            );
        }
    }

    public buildAST(node: ts.Node): ASTNode {
        const result = this.build(node);
        if (result == null || ASTNodeClassifier.instance.isASTNodeArray(result))
            throw new Error("Not a tree");
        return result;
    }
}
