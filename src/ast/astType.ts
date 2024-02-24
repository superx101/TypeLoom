export type TypePtr = TypeNode | null;

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

export type AllTypeNodes =
    | BasicTypeNode
    | LiteralTypeNode
    | FunctionTypeNode
    | UnionTypeNode
    | ArrayTypeNode
    | TupleTypeNode
    | TypeReferenceNode
    | TypeLiteralNode

export interface TypeParameter {
    name: string;
    constraint?: TypeReferenceNode;
}

export interface TypeParameters {
    typeParameters?: TypeParameter[];
}

export class TypeNode {
    constructor(public readonly kind: TypeNodeKind) {}
}

export class BasicTypeNode extends TypeNode {
    constructor(public value: BasicType) {
        super(TypeNodeKind.Basic);
    }
}

export class LiteralTypeNode extends TypeNode {
    constructor(public value: string | number | boolean) {
        super(TypeNodeKind.Literal);
    }
}

export interface ParameterType {
    name: string;
    type: TypeNode;
    optional: boolean;
}

export interface PropertyType extends ParameterType {}

export class FunctionTypeNode extends TypeNode implements TypeParameters {
    constructor(
        public parameters: ParameterType[],
        public returnType: TypeNode,
        public typeParameters?: TypeParameter[],
    ) {
        super(TypeNodeKind.Function);
    }
}

export class UnionTypeNode extends TypeNode {
    constructor(
        public elements: TypeNode[],
    ) {
        super(TypeNodeKind.Union);
    }
}

export class ArrayTypeNode extends TypeNode {
    constructor(
        public elementType: TypeNode,
    ) {
        super(TypeNodeKind.Array);
    }
}

export class TupleTypeNode extends TypeNode {
    constructor(
        public elements: TypeNode[],
    ) {
        super(TypeNodeKind.Tuple);
    }
}

export class TypeReferenceNode extends TypeNode {
    constructor(
        public value: string,
        public members?: TypeNode[],
    ) {
        super(TypeNodeKind.TypeReference);
    }
}

export class TypeLiteralNode extends TypeNode {
    constructor(
        public members: PropertyType[],
    ) {
        super(TypeNodeKind.TypeLiteral);
    }
}