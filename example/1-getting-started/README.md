## Example 1：*Hello World*

### What does this section do?

This section generates an AST from the source.d.ts file with a parser, and reconverts the AST into a d.ts file

#### Basic Types

source.d.ts is different from a normal d.ts file in that the basic types should be replaced in the definition file with the types specified by the library. If there is any typescript base type, the parser will report an error.

The base types specified by this library are as follows:

```ts
declare type dint = number;
declare type dfloat = number;
declare type dvoid = void;
declare type dstring = string;
declare type dany = any;
declare type dbool = boolean;
```

The library's dts parser ignores all **type alias definitions**, so only the type with the corresponding name needs to be used in the declaration file.

The following two type definitions make no difference to the dts parser

```ts
declare type dint = string;

declare type dint = number;
```

### jsDoc

This library customizes a comment, documentation generation rule that uses tags to determine whether to generate certain comments or documentation.

Under the dts parser, use the syntax of jsDoc to define tags

Example.

```ts
/**
 * @disable
 */
class MyClass {
  prop1: dint；

  /**
   * @params true
   * @returns true
   */
  constructor(p1: dstring, p2: dbool)；
}
```

**The labeling rules will be given later in the example **

### Note:

The d.ts file in this example is slightly more complex, so if you can't understand it, you can skip this section.