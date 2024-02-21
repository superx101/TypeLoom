## 示例1： *Hello World*

### 本节做了什么？

本节通过一个解析器从 source.d.ts 文件生成 AST, 并将 AST 重新转换为 d.ts 文件

#### 基本类型

source.d.ts 与普通的 d.ts 文件不同，在定义文件中，应该使用本库指定的类型，替换基本类型。若出现任何的typescript的基本类型，解析器将会报错

本库指定的基本类型如下：

```ts
declare type dint = number;
declare type dfloat = number;
declare type dvoid = void;
declare type dstring = string;
declare type dany = any;
declare type dbool = boolean;
```

本库的 dts 解析器会忽略所有的 **类型别名定义**，因此声明文件中仅需要使用对应名称的类型即可

下面的两个类型定义对于dts解析器来说毫无差异

```ts
declare type dint = string;

declare type dint = number;
```

### jsDoc

本库自定义了一个注释、文档生成规则，使用标签来确定是否生成某些注释或文档。

在 dts 解析器下，使用jsDoc的语法来定义标签

例如:

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

**标签规则将在后面的示例中给出**

### 注意：

本例中的d.ts文件稍显复杂，如果您无法理解，可以跳过本节。