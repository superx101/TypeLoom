import { TypeNode, TypeParameter, TypeParameters, TypeReferenceNode } from "./astType";
import { DocFlags } from "./docFlag";

export enum ASTNodeKind {
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
    TypeParameter,
    SourceFile,
    Root,
}

export type ASTPtr = ASTNode | null;

export enum ModifierKind {
    Async,
    Readonly,
    Static,
}

export interface ASTBaseProperty {
    name: string;
    parent: ASTPtr;
    docFlags?: DocFlags;
}

export class ASTNode implements ASTBaseProperty {
    public name: string;
    public parent: ASTPtr;
    public docFlags?: DocFlags;

    constructor(
        public readonly kind: ASTNodeKind,
        baseProperty: ASTBaseProperty,
    ) {
        this.name = baseProperty.name;
        this.parent = baseProperty.parent;
        this.docFlags = baseProperty.docFlags;
    }
}

export class TypeAliasNode extends ASTNode {
    constructor(
        baseProperty: ASTBaseProperty,
        public value: TypeNode,
    ) {
        super(
            ASTNodeKind.Type,
            baseProperty
        );
    }
}

export class VarLikeNode extends ASTNode {
    constructor(
        kind: ASTNodeKind,
        baseProperty: ASTBaseProperty,
        public type: TypeNode,
    ) {
        super(
            kind,
            baseProperty
        );
    }
}

export class VarNode extends VarLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        type: TypeNode,
        public isConst: boolean,
    ) {
        super(
            ASTNodeKind.Var,
            baseProperty,
            type
        );
    }
}

export class ParameterNode extends VarLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        type: TypeNode,
        public isOptional: boolean,
    ) {
        super(
            ASTNodeKind.Param,
            baseProperty,
            type
        );
    }
}

export class PropertyNode extends VarLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        type: TypeNode,
        public isOptional: boolean,
        public modifier: ModifierKind[]
    ) {
        super(
            ASTNodeKind.Property,
            baseProperty,
            type
        );
    }
}

export class EnumNode extends ASTNode {
    constructor(
        baseProperty: ASTBaseProperty,
        public values: { name: string; value: string | number }[],
    ) {
        super(
            ASTNodeKind.Enum,
            baseProperty
        );
    }
}

export interface FunctionLikeProperty extends TypeParameters {
    parameters: ParameterNode[];
    returnType?: TypeNode;
}

export class FunctionLikeNode extends ASTNode implements FunctionLikeProperty {
    public parameters: ParameterNode[];
    public returnType?: TypeNode;
    public typeParameters?: TypeParameter[] | undefined;

    constructor(
        kind: ASTNodeKind,
        baseProperty: ASTBaseProperty,
        functionLikeProperty: FunctionLikeProperty,
    ) {
        super(
            kind,
            baseProperty
        );

        this.parameters = functionLikeProperty.parameters;
        this.returnType = functionLikeProperty.returnType;
        this.typeParameters = functionLikeProperty.typeParameters;
    }
}

export class FunctionNode extends FunctionLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        functionLikeProperty: FunctionLikeProperty,
    ) {
        super(
            ASTNodeKind.Function,
            baseProperty,
            functionLikeProperty
        );
    }
}

export class MethodNode extends FunctionLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        functionLikeProperty: FunctionLikeProperty,
        public modifier: ModifierKind[]
    ) {
        super(
            ASTNodeKind.Method,
            baseProperty,
            functionLikeProperty
        );
    }

    public isStatic() {
        return this.modifier.includes(ModifierKind.Static);
    }
}

export class ConstructorNode extends FunctionLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        functionLikeProperty: FunctionLikeProperty,
    ) {
        super(
            ASTNodeKind.Constructor,
            baseProperty,
            functionLikeProperty
        );
        this.name = "constructor";
    }
}

export interface ClassLikeProperty extends TypeParameters {
    properties: PropertyNode[],
    methods: FunctionLikeNode[],
    extends: TypeReferenceNode[]
}

export class ClassLikeNode extends ASTNode implements ClassLikeProperty {
    public properties: PropertyNode[];
    public methods: FunctionLikeNode[];
    public extends: TypeReferenceNode[];
    public typeParameters?: TypeParameter[];

    constructor(
        kind: ASTNodeKind,
        baseProperty: ASTBaseProperty,
        classLikeProperty: ClassLikeProperty
    ) {
        super(
            kind,
            baseProperty
        );

        this.properties = classLikeProperty.properties;
        this.methods = classLikeProperty.methods;
        this.extends = classLikeProperty.extends;
        this.typeParameters = classLikeProperty.typeParameters;
    }
}

export class ClassNode extends ClassLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        classLikeProerty: ClassLikeProperty,
        public classImplements: TypeReferenceNode[]
    ) {
        super(
            ASTNodeKind.Class,
            baseProperty,
            classLikeProerty
        );
    }
}

export class InterfaceNode extends ClassLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        classLikeProerty: ClassLikeProperty,
    ) {
        super(
            ASTNodeKind.Interface,
            baseProperty,
            classLikeProerty
        );
    }
}

export class ModuleLikeNode extends ASTNode {
    constructor(
        kind: ASTNodeKind,
        baseProperty: ASTBaseProperty,
        public children: ASTNode[] = [],
    ) {
        super(
            kind,
            baseProperty
        );
    }
}

export class NamespaceNode extends ModuleLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        children: ASTNode[] = [],
    ) {
        super(
            ASTNodeKind.Namespace,
            baseProperty,
            children
        );
    }
}

export class SourceFileNode extends ModuleLikeNode {
    constructor(
        baseProperty: ASTBaseProperty,
        children: ASTNode[] = [],
    ) {
        super(
            ASTNodeKind.SourceFile,
            baseProperty,
            children
        );
    }
}

export class RootNode extends ModuleLikeNode {
    constructor(
        children: ASTNode[] = [],
    ) {
        super(
            ASTNodeKind.Root,
            {
                name: "root",
                parent: null,
            },
            children
        );
    }
}