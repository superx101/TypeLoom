import { TypeNode, TypeParameters, TypeReferenceNode } from "./astType";
import { DocFlags } from "./docFlag";

export enum ASTNodeKind {
    Root,
    Var,
    Param,
    Function,
    Class,
    Property,
    Method,
    Constructor,
    Enum,
    Namespace,
    Interface,
    Type,
    TypeParameter
}

export interface ASTNode {
    kind: ASTNodeKind;
    name: string;
    docFlags?: DocFlags;
    parent?: ASTNode;
}

export interface ASTView extends Omit<ASTNode, "kind"> {
    kind: string;
}

export type ASTPtr = ASTNode | undefined;

export interface TypeAliasNode extends ASTNode {
    kind: ASTNodeKind.Type;
    value: TypeNode;
}

export interface VarLikeNode extends ASTNode {
    type: TypeNode;
}

export interface VarNode extends VarLikeNode {
    kind: ASTNodeKind.Var;
    type: TypeNode;
    const: boolean;
}

export interface ParameterNode extends VarLikeNode {
    kind: ASTNodeKind.Param;
    optional: boolean;
}

export interface PropertyNode extends VarLikeNode {
    kind: ASTNodeKind.Property;
    optional: boolean;
    readonly: boolean;
    static: boolean;
}

export interface EnumNode extends ASTNode {
    kind: ASTNodeKind.Enum;
    values: { name: string; value: string | number }[];
}

export interface FunctionLikeNode extends ASTNode, TypeParameters {
    parameters: ParameterNode[];
    returnType: TypeNode;
    async: boolean;
}

export interface FunctionNode extends FunctionLikeNode {
    kind: ASTNodeKind.Function;
}

export interface MethodNode extends FunctionLikeNode {
    kind: ASTNodeKind.Method;
    static: boolean;
}

export interface ConstructorNode extends Omit<FunctionLikeNode, "async" | "returnType"> {
    kind: ASTNodeKind.Constructor;
    returnType?: TypeNode;
}

export interface ClassLikeNode extends ASTNode, TypeParameters {
    properties: PropertyNode[];
    methods: MethodNode[];
    extends: TypeReferenceNode[];
}

export interface ClassNode extends Omit<ClassLikeNode, "methods"> {
    kind: ASTNodeKind.Class;
    methods: (MethodNode | ConstructorNode)[];
    implements: TypeReferenceNode[];
}

export interface InterfaceNode extends ClassLikeNode {
    kind: ASTNodeKind.Interface;
}

export interface ModuleLikeNode extends ASTNode {
    children: ASTNode[];
}

export interface NamespaceNode extends ModuleLikeNode {
    kind: ASTNodeKind.Namespace;
}

export interface RootNode extends ModuleLikeNode {
    kind: ASTNodeKind.Root;
}