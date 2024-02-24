import {
    BasicType,
    BasicTypeNode,
    TypeReferenceNode,
    TypeNode,
    UnionTypeNode,
    FunctionTypeNode,
    ParameterType,
    TypeLiteralNode,
    LiteralTypeNode,
    TypeParameter,
    ArrayTypeNode,
    TupleTypeNode,
} from "../../ast";

import { SingletonProperty } from "src/util/classDecorator";

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

    private readonly basicTypeSet: Set<string>;

    constructor() {
        const set = new Set<string>();
        for (const key in BasicType)
            set.add(BasicType[key]);

        this.basicTypeSet = set;
    }

    public getParameters(node: ts.ParameterDeclaration): ParameterType {
        return {
            name: node.name.getText(),
            type: this.build(node.type!),
            optional: !!node.questionToken,
        };
    }

    public createTypeReferenceByExpressionWithTypeArguments(
        node: ts.ExpressionWithTypeArguments,
    ): TypeReferenceNode {
        return new TypeReferenceNode(
            node.expression.getText(),
            node.typeArguments?.map((type) => this.build(type)),
        );
    }

    public buildLiteralType(node: ts.LiteralTypeNode): LiteralTypeNode {
        return new LiteralTypeNode(node.literal.getText());
    }

    public buildFunction(node: ts.FunctionTypeNode): FunctionTypeNode {
        return new FunctionTypeNode(
            node.parameters.map((parameter) => this.getParameters(parameter)),
            this.build(node.type),
            TypeParameterBuilder.instance.buildTypeParameters(
                node.typeParameters,
            ),
        );
    }

    public buildTypeReference(
        tsNode: ts.TypeReferenceNode,
    ): BasicTypeNode | TypeReferenceNode {
        const text = tsNode.getText();
        if (this.basicTypeSet.has(text))
            return new BasicTypeNode(BasicType[text as keyof typeof BasicType]);

        return new TypeReferenceNode(
            tsNode.typeName.getText(),
            tsNode.typeArguments?.map((type) => this.build(type)),
        );
    }

    public buildUnion(tsNode: ts.UnionTypeNode): UnionTypeNode {
        return new UnionTypeNode(
            tsNode.types.map((type) => this.build(<ts.TypeNode>type)),
        );
    }

    public buildArray(tsNode: ts.ArrayTypeNode): ArrayTypeNode {
        return new ArrayTypeNode(this.build(tsNode.elementType));
    }

    public buildTuple(tsNode: ts.TupleTypeNode): TupleTypeNode {
        return new TupleTypeNode(
            tsNode.elements.map((type) => this.build(type)),
        );
    }

    public buildTypeLiteral(tsNode: ts.TypeLiteralNode): TypeLiteralNode {
        return new TypeLiteralNode(
            tsNode.members.map((member) => {
                return {
                    name: member.name!.getText(),
                    type: this.build((<ts.PropertySignature>member).type!),
                    optional: !!(<ts.PropertySignature>member).questionToken,
                };
            }),
        );
    }

    public build(tsNode: ts.TypeNode): TypeNode {
        if (tsNode == null)
            tsNode;

        switch (tsNode.kind) {
        case ts.SyntaxKind.TypeReference:
            return this.buildTypeReference(<ts.TypeReferenceNode>tsNode);
        case ts.SyntaxKind.UnionType:
            return this.buildUnion(<ts.UnionTypeNode>tsNode);
        case ts.SyntaxKind.FunctionType:
            return this.buildFunction(<ts.FunctionTypeNode>tsNode);
        case ts.SyntaxKind.TypeLiteral:
            return this.buildTypeLiteral(<ts.TypeLiteralNode>tsNode);
        case ts.SyntaxKind.ArrayType:
            return this.buildArray(<ts.ArrayTypeNode>tsNode);
        case ts.SyntaxKind.TupleType:
            return this.buildTuple(<ts.TupleTypeNode>tsNode);
        case ts.SyntaxKind.LiteralType:
            return this.buildLiteralType(<ts.LiteralTypeNode>tsNode);
        default:
            throw new Error(
                `Unknown type kind: [${tsNode.kind}] ${ts.SyntaxKind[tsNode.kind]}. Kind: ${tsNode.getText()}`,
            );
        }
    }
}
