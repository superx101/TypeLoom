/// <reference path="./type/declareType.d.ts" />

declare namespace namespaceTestNamespace {
    namespace Namespace1 {}
    namespace Namespace2 {
        namespace Namespace3 {}
    }
}
declare const v1: dint;

declare namespace variableTestNamespace {
    let v1: dint;
    var v2: dint;
    const v3: dint;
}

declare namespace typeTestNamespace {
    const v1: dint;
    const v2: dfloat;
    const v3: "literal";
    const v4: () => dvoid;
    const v5: (p1: dint) => dvoid;
    const v6: (p1: dint, p2: dbool) => dvoid;
    const v7: (p1: () => dint) => dvoid;
    const v8: <T>() => T;
    const v9: <T extends dstring, U>() => T;
    const v10: { p1: dint; p2: dbool };
    const v11: dint[];
    const v12: dint[][];
    const v13: [dstring, dint];
    const v14: [dstring, dint][];
    const v15: dint | dstring;
}

declare namespace functionTestNamespace {
    interface Interface1<T> {
        i1p1: T;
    }

    function f1(): dint;
    function f2(p1: dint): dvoid;
    function f3(p1: dint, p2: dbool): dvoid;
    function f4(p1: () => dint): dvoid;
    function f5<T>(): T;
    function f6<T extends dstring, U>(): T;
    function f7(p1: { p1: dint; p2: dbool }): dvoid;
    function f8(p1: Interface1<dint>): dvoid;
}

declare namespace interfaceTestNamaspace {
    interface Interface1 {
        i1p1: dint;
        i1p2?: dint;
        readonly i1p3: dint;
        i1p4: () => dint;
        i1p5: <T>(p1: dbool) => dint;
        i1p6: {
            i1p7: dint;
            i1p8?: {
                i1p9?: dint;
            };
        };
    }

    interface Interface2 extends Interface1 {}

    interface Interface3 {
        i3p1: dint;
    }

    interface Interface4 {
        i4p1: dint;
    }

    interface Interface5<T> {
        i5p1: T;
    }

    interface Interface6<T> extends Interface5<T>, Interface4 {}
}

declare namespace classTestNamespace {
    interface Interface1 {}

    namespace other {
        class Class1 {}
        class Class2<T> {}

        interface Interface1 {}
        interface Interface2<T> {}
    }

    class Class1 {
        constructor(p1: dint);

        c1p1: dint;
        readonly c1p2: dint;
        static c1p3: dint;
        static readonly c1p4: dint;

        c1p5: () => dint;
        readonly c1p6: () => dint;
        static c1p7: () => dint;
        static readonly c1p8: () => dint;
        c1p9: <T>(param1: dbool) => dint;

        c1m1(): dint;
        static c1m2(): dint;
        c1m3<T>(): T;
    }

    class Class2 extends Class1 {
        c2p1: dint;
    }

    class Class3 extends other.Class1 implements other.Interface1 {
    }

    class Class4
        implements
        other.Interface1,
            Interface1
    {
        i3p1: dint;
        i4p1: dint;
    }

    class Class5<T> {
        c4p1: T;
    }

    class Class6<T, U> extends other.Class2<T> {}

    class Class7<T extends Class6<Class5<dint>, dstring>> {}

    class Class8 extends Class7<Class6<Class5<dint>, dstring>> {}

    class Class9<T> extends Class5<T> {}

    class Class10<T> implements other.Interface1, other.Interface2<T> {
    }
}

declare namespace enumTestNamespace {
    enum Enum1 {
        A,
        B,
        C
    }
    enum Enum2 {
        A = "A",
        B = "B",
        C = "c"
    }
}

declare namespace docFlagsTestNamespace {
    /**
     * Make this node uncommented
     * @disable
     */
    interface Interface1 {}

    /**
     * Mark as deprecated in the comments
     * @deprecated
     */
    interface Interface2 {
        /**
         * @deprecated
         * 
         * Add a sample in the comments
         * @example
         */
        i2p1: dint;
        /**
         * Not legal, "params" "returns" is only allowed for function nodes, not function types
         * @params
         * @returns 
         */
        i2p2: (p1: dint)=> dint;
    }

    class Class1 {
        constructor(p1: dint, p2: dbool);
        c1p1: dint;
        /**
         * @returns false
         */ 
        c1m1(): dint;
        /**
         * @params false
         * @returns true
         */
        c1m2(p1: dint, p2: dstring): dint;
        /**
         * @text
         * @params
         * @returns
         * @text
         */
        c2m3(p1: dint, p2: dstring): dint;
    }
}