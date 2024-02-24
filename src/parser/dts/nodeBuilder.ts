import { DocFlagParser } from "./flagBuilder";
import { TypeBuilder, TypeParameterBuilder } from "./typeBuilder";

import {
    ASTBaseProperty,
    ASTNode,
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
    SourceFileNode,
    VarNode,
    ModifierKind,
    FunctionLikeProperty,
} from "../../ast/astNode";

import { TypeReferenceNode } from "src/ast";

import ts from "typescript";

import path from "path";

export class ASTNodeBuilder {
    protected relativePath: string;

    constructor(
        private sourceFile: ts.SourceFile,
        mainPath: string,
    ) {
        this.relativePath = path.relative(
            path.dirname(mainPath),
            sourceFile.fileName,
        );
        console.log("relative:", this.relativePath);
    }

    public getModifiers(
        tsModiriers:
            | ts.NodeArray<ts.ModifierLike>
            | ts.NodeArray<ts.Modifier>
            | undefined,
    ): ModifierKind[] {
        const modifiers: ModifierKind[] = [];
        if (!tsModiriers)
            return modifiers;

        return <ModifierKind[]>tsModiriers
            .map((modifier) => {
                switch (modifier.kind) {
                case ts.SyntaxKind.StaticKeyword:
                    return ModifierKind.Static;
                case ts.SyntaxKind.ReadonlyKeyword:
                    return ModifierKind.Readonly;
                case ts.SyntaxKind.AsyncKeyword:
                    return ModifierKind.Async;
                default:
                    return null;
                }
            })
            .filter((modifier) => modifier != null);
    }

    public getBaseProperty(
        tsNode: ts.NamedDeclaration,
        parent: ASTNode,
        hasDoc: boolean = true,
    ): ASTBaseProperty {
        return {
            name: tsNode.name ? tsNode.name.getText() : "",
            docFlags: hasDoc
                ? DocFlagParser.instance.getDocFlagsByNode(
                    tsNode,
                    this.sourceFile,
                )
                : undefined,
            parent: parent,
        };
    }

    public getFunctionLikeProperty(
        tsNode:
            | ts.FunctionLikeDeclaration
            | ts.FunctionOrConstructorTypeNode
            | ts.MethodSignature
            | ts.ConstructorTypeNode,
        parent: ASTNode,
    ): FunctionLikeProperty {
        return {
            typeParameters: TypeParameterBuilder.instance.buildTypeParameters(
                tsNode.typeParameters,
            ),
            parameters: tsNode.parameters.map((parameter) =>
                this.buildParam(<ts.ParameterDeclaration>parameter, parent),
            ),
            returnType: tsNode.type ? TypeBuilder.instance.build(tsNode.type!) : undefined,
        };
    }

    public buildEnum(tsNode: ts.EnumDeclaration, parent: ASTNode): EnumNode {
        const values = tsNode.members.map((member, index) => {
            return {
                name: member.name.getText(this.sourceFile),
                value: member.initializer?.getText(this.sourceFile) || index,
            };
        });
        return new EnumNode(this.getBaseProperty(tsNode, parent), values);
    }

    public buildVars(tsNode: ts.VariableStatement, parent: ASTNode): VarNode[] {
        // Need Help: How to distinguish const,var,let ???
        const isConst = (tsNode.declarationList.flags as any) === 33554434;
        return tsNode.declarationList.declarations.map((declaration) => {
            return new VarNode(
                this.getBaseProperty(declaration, parent),
                TypeBuilder.instance.build(declaration.type!),
                isConst,
            );
        });
    }

    public buildParam(
        tsNode: ts.ParameterDeclaration,
        parent: ASTNode,
    ): ParameterNode {
        return new ParameterNode(
            this.getBaseProperty(tsNode, parent),
            TypeBuilder.instance.build(tsNode.type!),
            tsNode.questionToken != null,
        );
    }

    public buildProperty(
        tsNode: ts.PropertyDeclaration | ts.PropertySignature,
        parent: ASTNode,
    ): PropertyNode {
        return new PropertyNode(
            this.getBaseProperty(tsNode, parent),
            TypeBuilder.instance.build(tsNode.type!),
            tsNode.questionToken != null,
            this.getModifiers(tsNode.modifiers),
        );
    }

    public buildFunction(
        tsNode: ts.FunctionDeclaration,
        parent: ASTNode,
    ): FunctionNode {
        return new FunctionNode(
            this.getBaseProperty(tsNode, parent),
            this.getFunctionLikeProperty(tsNode, parent),
        );
    }

    public buildMethod(
        tsNode: ts.MethodDeclaration | ts.MethodSignature,
        parent: ASTNode,
    ): MethodNode {
        return new MethodNode(
            this.getBaseProperty(tsNode, parent),
            this.getFunctionLikeProperty(tsNode, parent),
            this.getModifiers(tsNode.modifiers),
        );
    }

    public buildClass(tsNode: ts.ClassDeclaration, parent: ASTNode): ClassNode {
        const properties: PropertyNode[] = [];
        const methods: (MethodNode | ConstructorNode)[] = [];
        const classExtend: TypeReferenceNode[] = [];
        const classImplements: TypeReferenceNode[] = [];

        const node = new ClassNode(
            this.getBaseProperty(tsNode, parent),
            {
                properties,
                methods,
                extends: classExtend,
                typeParameters: TypeParameterBuilder.instance.buildTypeParameters(tsNode.typeParameters)
            },
            classImplements,
        );

        // set extend and implements
        tsNode.heritageClauses?.forEach((clause) => {
            switch (clause.token) {
            case ts.SyntaxKind.ExtendsKeyword:
                classExtend[0] =
                        TypeBuilder.instance.createTypeReferenceByExpressionWithTypeArguments(
                            clause.types[0],
                        );
                break;
            case ts.SyntaxKind.ImplementsKeyword:
                classImplements.push(
                    ...clause.types.map((express) =>
                        TypeBuilder.instance.createTypeReferenceByExpressionWithTypeArguments(
                            express,
                        ),
                    ),
                );
                break;
            }
        });

        // set property and method
        tsNode.members.forEach((member) => {
            switch (member.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                properties.push(
                    this.buildProperty(
                            <ts.PropertyDeclaration>member,
                            node,
                    ),
                );
                break;
            case ts.SyntaxKind.MethodDeclaration:
                methods.push(
                    this.buildMethod(<ts.MethodDeclaration>member, node),
                );
                break;
            case ts.SyntaxKind.Constructor:
                methods.push(
                    new ConstructorNode(
                        this.getBaseProperty(member, node),
                        this.getFunctionLikeProperty(
                                <ts.ConstructorDeclaration>member,
                                node,
                        ),
                    ),
                );
            }
        });
        return node;
    }

    public buildInterface(
        tsNode: ts.InterfaceDeclaration,
        parent: ASTNode,
    ): InterfaceNode {
        const properties: PropertyNode[] = [];
        const methods: MethodNode[] = [];
        const interfaceExtends: TypeReferenceNode[] = [];

        const node = new InterfaceNode(this.getBaseProperty(tsNode, parent), {
            properties,
            methods,
            extends: interfaceExtends,
            typeParameters: TypeParameterBuilder.instance.buildTypeParameters(
                tsNode.typeParameters)
        });

        // set extends
        tsNode.heritageClauses?.forEach((clause) => {
            interfaceExtends.concat(
                clause.types.map((express) =>
                    TypeBuilder.instance.createTypeReferenceByExpressionWithTypeArguments(
                        express,
                    ),
                ),
            );
        });

        // set members
        tsNode.members.forEach((member) => {
            if (ts.isPropertySignature(member))
                properties.push(this.buildProperty(member, node));
            else if (ts.isMethodSignature(member))
                methods.push(this.buildMethod(member, node));
        });

        return node;
    }

    public buildNamespace(
        tsNode: ts.NamespaceDeclaration,
        parent: ASTNode,
    ): NamespaceNode {
        const node = new NamespaceNode(this.getBaseProperty(tsNode, parent));
        node.children = this.buildModelLikeChildren(
            (<ts.ModuleBlock>tsNode.body).statements,
            node,
        );
        return node;
    }

    public build(node: ts.Node, parent: ASTNode): ASTNode | ASTNode[] | null {
        switch (node.kind) {
        case ts.SyntaxKind.VariableStatement:
            return this.buildVars(<ts.VariableStatement>node, parent);
        case ts.SyntaxKind.EnumDeclaration:
            return this.buildEnum(<ts.EnumDeclaration>node, parent);
        case ts.SyntaxKind.FunctionDeclaration:
            return this.buildFunction(<ts.FunctionDeclaration>node, parent);
        case ts.SyntaxKind.ClassDeclaration:
            return this.buildClass(<ts.ClassDeclaration>node, parent);
        case ts.SyntaxKind.InterfaceDeclaration:
            return this.buildInterface(
                    <ts.InterfaceDeclaration>node,
                    parent,
            );
        case ts.SyntaxKind.ModuleDeclaration:
            return this.buildNamespace(
                    <ts.NamespaceDeclaration>node,
                    parent,
            );
        case ts.SyntaxKind.TypeAliasDeclaration:
        case ts.SyntaxKind.EndOfFileToken:
            return null;
        default:
            throw new Error(
                `Unknown node kind: [${node.kind}] ${ts.SyntaxKind[node.kind]}. Node: ${node.getText()}`,
            );
        }
    }

    public buildModelLikeChildren(
        statements: ts.NodeArray<ts.Statement>,
        parent: ASTNode,
    ) {
        const children: ASTNode[] = [];
        statements.forEach((statement) => {
            const child = this.build(statement, parent);
            if (child)
                if (Array.isArray(child))
                    children.push(...child);
                else
                    children.push(child);
        });
        return children;
    }

    public buildSourceFile(
        tsSourceFile: ts.SourceFile,
        parent: RootNode,
    ): SourceFileNode {
        const dirname = path.dirname(this.relativePath).replace(/\.\.\//g, "#");
        const translatedDirname = dirname === "." ? "" : dirname + ".";
        const name =
            translatedDirname +
            path.basename(this.relativePath).replace(/\./g, "-");

        const sourceFileNode = new SourceFileNode({
            name,
            parent,
        });
        sourceFileNode.children = this.buildModelLikeChildren(
            tsSourceFile.statements,
            sourceFileNode,
        );
        return sourceFileNode;
    }
}
