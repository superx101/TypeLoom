export interface TypeParameter {
    name: string;
    constraint?: TypeReferenceNode
}

export interface TypeParameters {
    typeParameters?: TypeParameter[];
}

export enum TypeNodeKind {
    Basic,
    Literal,
    Function,
    Union,
    TypeReference,
    TypeLiteral,
}

export enum BasicType {
    Boolean,
    Integer,
    Float,
    String,
    Void,
    Any,
}

export interface BasicTypeNode {
    kind: TypeNodeKind.Basic;
    value: BasicType;
}

export interface LiteralTypeNode {
    kind: TypeNodeKind.Literal;
    value: string | number | boolean;
}

export interface ParameterType {
    name: string;
    type: TypeNode;
}

export interface PropertyType extends ParameterType {}

export interface FunctionTypeNode extends TypeParameters {
    kind: TypeNodeKind.Function;
    parameters: ParameterType[];
    returnType: TypeNode;
}

export interface UnionTypeNode {
    kind: TypeNodeKind.Union;
    value: Exclude<TypeNode, UnionTypeNode>[];
}

export interface TypeReferenceNode {
    kind: TypeNodeKind.TypeReference;
    members?: TypeNode[];
    value: string;
}

export interface TypeLiteralNode {
    kind: TypeNodeKind.TypeLiteral;
    members: PropertyType[];
}

export type TypeNode =
    | BasicTypeNode
    | LiteralTypeNode
    | FunctionTypeNode
    | UnionTypeNode
    | TypeReferenceNode
    | TypeLiteralNode

export type TypePtr = TypeNode | undefined;
