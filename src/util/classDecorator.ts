export function SingletonConstructor(
    target: Record<string | symbol, any>,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        if (!target.instance)
            target.instance = originalMethod.apply(this, args);

        return target.instance;
    };
}

export function SingletonProperty(
    target: Record<string | symbol, any>,
    propertyKey: string | symbol,
) {
    let instance: any;

    Object.defineProperty(target, propertyKey, {
        get: function () {
            if (!instance)
                instance = new this();
            return instance;
        },
        enumerable: true,
        configurable: true,
    });
}

export function Data(constructor: Function | ObjectConstructor) {
    Object.getOwnPropertyNames(new constructor()).forEach((key) => {
        const firstUpperProperty =
            key.charAt(0).toUpperCase() + key.substring(1);

        const getKey = `get${firstUpperProperty}`;
        if (!constructor.prototype[getKey])
            constructor.prototype[getKey] = function () {
                return this[key];
            };

        const setKey = `set${firstUpperProperty}`;
        if (!constructor.prototype[setKey])
            constructor.prototype[setKey] = function (
                value: any,
            ) {
                this[key] = value;
            };
    });
}
