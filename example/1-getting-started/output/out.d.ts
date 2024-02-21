
// file: source-d-ts

/**
 * source-d-ts.namespace-test-namespace.text0
 */
declare namespace namespaceTestNamespace {
    /**
     * source-d-ts.namespace-test-namespace.namespace1.text0
     */
    namespace Namespace1 {}
    /**
     * source-d-ts.namespace-test-namespace.namespace2.text0
     */
    namespace Namespace2 {
        /**
         * source-d-ts.namespace-test-namespace.namespace2.namespace3.text0
         */
        namespace Namespace3 {}
    }
}
/**
 * source-d-ts.v1.text0
 */
declare const v1: number;
/**
 * source-d-ts.variable-test-namespace.text0
 */
declare namespace variableTestNamespace {
    /**
     * source-d-ts.variable-test-namespace.v1.text0
     */
    let v1: number;
    /**
     * source-d-ts.variable-test-namespace.v2.text0
     */
    let v2: number;
    /**
     * source-d-ts.variable-test-namespace.v3.text0
     */
    const v3: number;
}
/**
 * source-d-ts.type-test-namespace.text0
 */
declare namespace typeTestNamespace {
    /**
     * source-d-ts.type-test-namespace.v1.text0
     */
    const v1: number;
    /**
     * source-d-ts.type-test-namespace.v2.text0
     */
    const v2: number;
    /**
     * source-d-ts.type-test-namespace.v3.text0
     */
    const v3: "literal";
    /**
     * source-d-ts.type-test-namespace.v4.text0
     */
    const v4: () => void;
    /**
     * source-d-ts.type-test-namespace.v5.text0
     */
    const v5: (p1: number) => void;
    /**
     * source-d-ts.type-test-namespace.v6.text0
     */
    const v6: (p1: number, p2: boolean) => void;
    /**
     * source-d-ts.type-test-namespace.v7.text0
     */
    const v7: (p1: () => number) => void;
    /**
     * source-d-ts.type-test-namespace.v8.text0
     */
    const v8: <T>() => T;
    /**
     * source-d-ts.type-test-namespace.v9.text0
     */
    const v9: <T extends string, U>() => T;
    /**
     * source-d-ts.type-test-namespace.v10.text0
     */
    const v10: { p1: number; p2: boolean };
    /**
     * source-d-ts.type-test-namespace.v11.text0
     */
    const v11: number[];
    /**
     * source-d-ts.type-test-namespace.v12.text0
     */
    const v12: number[][];
    /**
     * source-d-ts.type-test-namespace.v13.text0
     */
    const v13: [string, number];
    /**
     * source-d-ts.type-test-namespace.v14.text0
     */
    const v14: [string, number][];
    /**
     * source-d-ts.type-test-namespace.v15.text0
     */
    const v15: number | string;
}
/**
 * source-d-ts.function-test-namespace.text0
 */
declare namespace functionTestNamespace {
    /**
     * source-d-ts.function-test-namespace.interface1.text0
     */
    interface Interface1<T> {
        /**
         * source-d-ts.function-test-namespace.interface1.i1p1.text0
         */
        i1p1: T;
    }
    /**
     * source-d-ts.function-test-namespace.f1.text0
     * @returns source-d-ts.function-test-namespace.f1.returns
     */
    function f1(): number;
    /**
     * source-d-ts.function-test-namespace.f2.text0
     * @param p1 source-d-ts.function-test-namespace.f2.param.p1
     * @returns source-d-ts.function-test-namespace.f2.returns
     */
    function f2(p1: number): void;
    /**
     * source-d-ts.function-test-namespace.f3.text0
     * @param p1 source-d-ts.function-test-namespace.f3.param.p1
     * @param p2 source-d-ts.function-test-namespace.f3.param.p2
     * @returns source-d-ts.function-test-namespace.f3.returns
     */
    function f3(p1: number, p2: boolean): void;
    /**
     * source-d-ts.function-test-namespace.f4.text0
     * @param p1 source-d-ts.function-test-namespace.f4.param.p1
     * @returns source-d-ts.function-test-namespace.f4.returns
     */
    function f4(p1: () => number): void;
    /**
     * source-d-ts.function-test-namespace.f5.text0
     * @returns source-d-ts.function-test-namespace.f5.returns
     */
    function f5<T>(): T;
    /**
     * source-d-ts.function-test-namespace.f6.text0
     * @returns source-d-ts.function-test-namespace.f6.returns
     */
    function f6<T extends string, U>(): T;
    /**
     * source-d-ts.function-test-namespace.f7.text0
     * @param p1 source-d-ts.function-test-namespace.f7.param.p1
     * @returns source-d-ts.function-test-namespace.f7.returns
     */
    function f7(p1: { p1: number; p2: boolean }): void;
    /**
     * source-d-ts.function-test-namespace.f8.text0
     * @param p1 source-d-ts.function-test-namespace.f8.param.p1
     * @returns source-d-ts.function-test-namespace.f8.returns
     */
    function f8(p1: Interface1<number>): void;
}
/**
 * source-d-ts.interface-test-namaspace.text0
 */
declare namespace interfaceTestNamaspace {
    /**
     * source-d-ts.interface-test-namaspace.interface1.text0
     */
    interface Interface1 {
        /**
         * source-d-ts.interface-test-namaspace.interface1.i1p1.text0
         */
        i1p1: number;
        /**
         * source-d-ts.interface-test-namaspace.interface1.i1p2.text0
         */
        i1p2?: number;
        /**
         * source-d-ts.interface-test-namaspace.interface1.i1p3.text0
         */
        readonly i1p3: number;
        /**
         * source-d-ts.interface-test-namaspace.interface1.i1p4.text0
         */
        i1p4: () => number;
        /**
         * source-d-ts.interface-test-namaspace.interface1.i1p5.text0
         */
        i1p5: <T>(p1: boolean) => number;
        /**
         * source-d-ts.interface-test-namaspace.interface1.i1p6.text0
         */
        i1p6: { i1p7: number; i1p8?: { i1p9?: number } };
    }
    /**
     * source-d-ts.interface-test-namaspace.interface2.text0
     */
    interface Interface2 {}
    /**
     * source-d-ts.interface-test-namaspace.interface3.text0
     */
    interface Interface3 {
        /**
         * source-d-ts.interface-test-namaspace.interface3.i3p1.text0
         */
        i3p1: number;
    }
    /**
     * source-d-ts.interface-test-namaspace.interface4.text0
     */
    interface Interface4 {
        /**
         * source-d-ts.interface-test-namaspace.interface4.i4p1.text0
         */
        i4p1: number;
    }
    /**
     * source-d-ts.interface-test-namaspace.interface5.text0
     */
    interface Interface5<T> {
        /**
         * source-d-ts.interface-test-namaspace.interface5.i5p1.text0
         */
        i5p1: T;
    }
    /**
     * source-d-ts.interface-test-namaspace.interface6.text0
     */
    interface Interface6<T> {}
}
/**
 * source-d-ts.class-test-namespace.text0
 */
declare namespace classTestNamespace {
    /**
     * source-d-ts.class-test-namespace.interface1.text0
     */
    interface Interface1 {}
    /**
     * source-d-ts.class-test-namespace.other.text0
     */
    namespace other {
        /**
         * source-d-ts.class-test-namespace.other.class1.text0
         */
        class Class1 {}
        /**
         * source-d-ts.class-test-namespace.other.class2.text0
         */
        class Class2<T> {}
        /**
         * source-d-ts.class-test-namespace.other.interface1.text0
         */
        interface Interface1 {}
        /**
         * source-d-ts.class-test-namespace.other.interface2.text0
         */
        interface Interface2<T> {}
    }
    /**
     * source-d-ts.class-test-namespace.class1.text0
     */
    class Class1 {
        /**
         * source-d-ts.class-test-namespace.class1.c1p1.text0
         */
        c1p1: number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p2.text0
         */
        readonly c1p2: number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p3.text0
         */
        static c1p3: number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p4.text0
         */
        static readonly c1p4: number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p5.text0
         */
        c1p5: () => number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p6.text0
         */
        readonly c1p6: () => number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p7.text0
         */
        static c1p7: () => number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p8.text0
         */
        static readonly c1p8: () => number;
        /**
         * source-d-ts.class-test-namespace.class1.c1p9.text0
         */
        c1p9: <T>(param1: boolean) => number;
        /**
         * source-d-ts.class-test-namespace.class1.constructor.text0
         * @param p1 source-d-ts.class-test-namespace.class1.constructor.param.p1
         */
        constructor(p1: number);
        /**
         * source-d-ts.class-test-namespace.class1.c1m1.text0
         * @returns source-d-ts.class-test-namespace.class1.c1m1.returns
         */
        c1m1(): number;
        /**
         * source-d-ts.class-test-namespace.class1.c1m2.text0
         * @returns source-d-ts.class-test-namespace.class1.c1m2.returns
         */
        static c1m2(): number;
        /**
         * source-d-ts.class-test-namespace.class1.c1m3.text0
         * @returns source-d-ts.class-test-namespace.class1.c1m3.returns
         */
        c1m3<T>(): T;
    }
    /**
     * source-d-ts.class-test-namespace.class2.text0
     */
    class Class2 extends Class1 {
        /**
         * source-d-ts.class-test-namespace.class2.c2p1.text0
         */
        c2p1: number;
    }
    /**
     * source-d-ts.class-test-namespace.class3.text0
     */
    class Class3 extends other.Class1 implements other.Interface1 {}
    /**
     * source-d-ts.class-test-namespace.class4.text0
     */
    class Class4 implements other.Interface1, Interface1 {
        /**
         * source-d-ts.class-test-namespace.class4.i3p1.text0
         */
        i3p1: number;
        /**
         * source-d-ts.class-test-namespace.class4.i4p1.text0
         */
        i4p1: number;
    }
    /**
     * source-d-ts.class-test-namespace.class5.text0
     */
    class Class5<T> {
        /**
         * source-d-ts.class-test-namespace.class5.c4p1.text0
         */
        c4p1: T;
    }
    /**
     * source-d-ts.class-test-namespace.class6.text0
     */
    class Class6<T, U> extends other.Class2<T> {}
    /**
     * source-d-ts.class-test-namespace.class7.text0
     */
    class Class7<T extends Class6<Class5<number>, string>> {}
    /**
     * source-d-ts.class-test-namespace.class8.text0
     */
    class Class8 extends Class7<Class6<Class5<number>, string>> {}
    /**
     * source-d-ts.class-test-namespace.class9.text0
     */
    class Class9<T> extends Class5<T> {}
    /**
     * source-d-ts.class-test-namespace.class10.text0
     */
    class Class10<T> implements other.Interface1, other.Interface2<T> {}
}
/**
 * source-d-ts.enum-test-namespace.text0
 */
declare namespace enumTestNamespace {
    /**
     * source-d-ts.enum-test-namespace.enum1.text0
     */
    enum Enum1 {
        A = 0,
        B = 1,
        C = 2,
    }
    /**
     * source-d-ts.enum-test-namespace.enum2.text0
     */
    enum Enum2 {
        A = "A",
        B = "B",
        C = "c",
    }
}
/**
 * source-d-ts.doc-flags-test-namespace.text0
 */
declare namespace docFlagsTestNamespace {
    interface Interface1 {}
    /**
     * source-d-ts.doc-flags-test-namespace.interface2.text0
     * @deprecated source-d-ts.doc-flags-test-namespace.interface2.deprecated
     */
    interface Interface2 {
        /**
         * source-d-ts.doc-flags-test-namespace.interface2.i2p1.text0
         * @deprecated source-d-ts.doc-flags-test-namespace.interface2.i2p1.deprecated
         * @example source-d-ts.doc-flags-test-namespace.interface2.i2p1.example.ts
         */
        i2p1: number;
        /**
         * source-d-ts.doc-flags-test-namespace.interface2.i2p2.text0
         */
        i2p2: (p1: number) => number;
    }
    /**
     * source-d-ts.doc-flags-test-namespace.class1.text0
     */
    class Class1 {
        /**
         * source-d-ts.doc-flags-test-namespace.class1.c1p1.text0
         */
        c1p1: number;
        /**
         * source-d-ts.doc-flags-test-namespace.class1.constructor.text0
         * @param p1 source-d-ts.doc-flags-test-namespace.class1.constructor.param.p1
         * @param p2 source-d-ts.doc-flags-test-namespace.class1.constructor.param.p2
         */
        constructor(p1: number, p2: boolean);
        /**
         * source-d-ts.doc-flags-test-namespace.class1.c1m1.text0
         * @returns source-d-ts.doc-flags-test-namespace.class1.c1m1.returns
         */
        c1m1(): number;
        /**
         * source-d-ts.doc-flags-test-namespace.class1.c1m2.text0
         * @param p1 source-d-ts.doc-flags-test-namespace.class1.c1m2.param.p1
         * @param p2 source-d-ts.doc-flags-test-namespace.class1.c1m2.param.p2
         * @returns source-d-ts.doc-flags-test-namespace.class1.c1m2.returns
         */
        c1m2(p1: number, p2: string): number;
        /**
         * source-d-ts.doc-flags-test-namespace.class1.c2m3.text0
         * @param p1 source-d-ts.doc-flags-test-namespace.class1.c2m3.param.p1
         * @param p2 source-d-ts.doc-flags-test-namespace.class1.c2m3.param.p2
         * @returns source-d-ts.doc-flags-test-namespace.class1.c2m3.returns
         * source-d-ts.doc-flags-test-namespace.class1.c2m3.text1
         * source-d-ts.doc-flags-test-namespace.class1.c2m3.text2
         */
        c2m3(p1: number, p2: string): number;
    }
}
