import { SingletonProperty } from "./classDecorator";

import {
    ASTNode,
    ASTNodeKind,
    ASTPtr,
    ClassNode,
    FunctionLikeNode,
    ModuleLikeNode,
    VarLikeNode,
} from "../ast/astNode";
import {
    BasicType,
    FunctionTypeNode,
    TypeReferenceNode,
    TypeLiteralNode,
    TypeNode,
    TypeNodeKind,
    TypePtr,
    UnionTypeNode,
} from "../ast/astType";

export class ASTNodeVisitor {
    @SingletonProperty
    public static readonly instance: ASTNodeVisitor;

    public visitType<R>(
        parent: TypePtr,
        node: TypeNode,
        view: (parent: TypePtr, node: TypeNode) => R,
    ): R {
        switch (node.kind) {
        case TypeNodeKind.Union:
            (<UnionTypeNode>node).elements.forEach((t) =>
                this.visitType(node, t, view),
            );
            break;
        case TypeNodeKind.TypeReference:
            (<TypeReferenceNode>node).members?.forEach((m) =>
                this.visitType(node, m, view),
            );
            break;
        case TypeNodeKind.Function:
            (<FunctionTypeNode>node).parameters.forEach((p) =>
                this.visitType(node, p.type, view),
            );
            break;
        case TypeNodeKind.TypeLiteral:
            (<TypeLiteralNode>node).members.forEach((m) =>
                this.visitType(node, m.type, view),
            );
            break;
        }
        return view(parent, node);
    }

    public visitNode<R>(
        parent: ASTPtr,
        node: ASTNode,
        view: (parent: ASTPtr, node: ASTNode) => R,
    ): R {
        switch (node.kind) {
        case ASTNodeKind.Method:
        case ASTNodeKind.Function:
        case ASTNodeKind.Constructor:
            (<FunctionLikeNode>node).parameters.forEach((p) => {
                this.visitNode(node, p, view);
            });
            break;
        case ASTNodeKind.Class:
        case ASTNodeKind.Interface:
            (<ClassNode>node).properties.forEach((p) =>
                this.visitNode(node, p, view),
            );
            (<ClassNode>node).methods.forEach((m) =>
                this.visitNode(node, m, view),
            );
            break;
        case ASTNodeKind.Namespace:
        case ASTNodeKind.SourceFile:
        case ASTNodeKind.Root:
            (<ModuleLikeNode>node).children.forEach((c) =>
                this.visitNode(node, c, view),
            );
            break;
        }
        return view(parent, node);
    }
}

export class ASTUtil {
    @SingletonProperty
    public static readonly instance: ASTUtil;

    protected deepCopyObj(obj: any): any {
        if (typeof obj !== "object" || obj === null)
            return obj;

        const copy: any = Array.isArray(obj) ? [] : {};
        for (const key in obj)
            if (key === "parent")
                copy[key] = obj;
            else if (Object.hasOwnProperty.call(obj, key))
                copy[key] = this.deepCopyObj(obj[key]);

        return copy;
    }

    public isASTNodeArray(node: ASTNode | ASTNode[]): node is ASTNode[] {
        return Array.isArray(node);
    }

    public copyAST(node: ASTNode): ASTNode {
        return this.deepCopyObj(node);
    }

    protected translateType(_parent: any, node: any) {
        if (node.kind === TypeNodeKind.Basic)
            node.value = `TypeValue[${node.value}] ${BasicType[node.value]}`;
        node.kind = `Type[${node.kind}] ${TypeNodeKind[node.kind]}`;
    }

    public getString(node: ASTNode, space: number = 0): string {
        const copyNode = this.copyAST(node);
        ASTNodeVisitor.instance.visitNode(null, copyNode, (_parent: any, child: any) => {
            // set type's kind to string
            switch (child.kind) {
            case ASTNodeKind.Var:
            case ASTNodeKind.Param:
            case ASTNodeKind.Property:
                ASTNodeVisitor.instance.visitType(
                    null,
                    (<VarLikeNode>child).type,
                    this.translateType,
                );
                break;
            case ASTNodeKind.Function:
            case ASTNodeKind.Method:
                ASTNodeVisitor.instance.visitType(
                    null,
                    (<FunctionLikeNode>child).returnType!,
                    this.translateType,
                );
                break;
            }

            // set kind to string
            child.parent = undefined;
            child.kind = `Node[${child.kind}] ${ASTNodeKind[child.kind]}`;
        });
        return JSON.stringify(copyNode, null, space);
    }
}