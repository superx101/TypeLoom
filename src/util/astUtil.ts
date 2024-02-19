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

export class ASTUtil {
    @SingletonProperty
    public static readonly instance: ASTUtil;

    public visitType<R>(
        parent: TypePtr,
        node: TypeNode,
        view: (parent: TypePtr, node: TypeNode) => R,
    ): R {
        switch (node.kind) {
        case TypeNodeKind.Union:
            (<UnionTypeNode>node).value.forEach((t) =>
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
        case ASTNodeKind.Root:
            (<ModuleLikeNode>node).children.forEach((c) =>
                this.visitNode(node, c, view),
            );
            break;
        }
        return view(parent, node);
    }

    public deepCopyObj(obj: any): any {
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

    public copyAST(node: ASTNode): ASTNode {
        return this.deepCopyObj(node);
    }

    public isFunctionLikeNode(node: ASTNode): node is FunctionLikeNode {
        return (
            node.kind === ASTNodeKind.Method ||
            node.kind === ASTNodeKind.Function ||
            node.kind === ASTNodeKind.Constructor
        );
    }

    public isASTNodeArray(node: ASTNode | ASTNode[]): node is ASTNode[] {
        return Array.isArray(node);
    }

    public makeParent(node: ASTNode): void {
        this.visitNode(undefined, node, (parent, child) => {
            child.parent = parent;
        });
    }

    private translateType(_parent: any, node: any) {
        if (node.kind === TypeNodeKind.Basic)
            node.value = `TypeValue[${node.value}] ${BasicType[node.value]}`;
        node.kind = `Type[${node.kind}] ${TypeNodeKind[node.kind]}`;
    }

    public toString(node: ASTNode, space: number = 0) {
        const copyNode = this.copyAST(node);
        this.visitNode(undefined, copyNode, (_parent: any, child: any) => {
            // set type's kind to string
            switch (child.kind) {
            case ASTNodeKind.Var:
            case ASTNodeKind.Param:
            case ASTNodeKind.Property:
                this.visitType(
                    undefined,
                    (<VarLikeNode>child).type,
                    this.translateType,
                );
                break;
            case ASTNodeKind.Function:
            case ASTNodeKind.Method:
                this.visitType(
                    undefined,
                    (<FunctionLikeNode>child).returnType,
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
