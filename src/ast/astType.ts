export type TypeNode =
    | BasicTypeNode
    | LiteralTypeNode
    | FunctionTypeNode
    | UnionTypeNode
    | ArrayTypeNode
    | TupleTypeNode
    | TypeReferenceNode
    | TypeLiteralNode

export type TypePtr = TypeNode | undefined;

export enum TypeNodeKind {
    Basic,
    Literal,
    Function,
    Union,
    Array,
    Tuple,
    TypeReference,
    TypeLiteral,
}

export enum BasicType {
    dbool,
    dint,
    dfloat,
    dstring,
    dvoid,
    dany,
}

export interface TypeParameter {
    name: string;
    constraint?: TypeReferenceNode
}

export interface TypeParameters {
    typeParameters?: TypeParameter[];
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
    optional: boolean;
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

export interface ArrayTypeNode {
    kind: TypeNodeKind.Array;
    elementType: TypeNode;
}

export interface TupleTypeNode {
    kind: TypeNodeKind.Tuple;
    elements: TypeNode[];
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