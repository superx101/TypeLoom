import { SingletonProperty } from "./classDecorator";

import colors from "colors";

export class ConsoleUtil {
    @SingletonProperty
    public static readonly instance: ConsoleUtil;

    protected logConstructor(colorFn: (text: string) => string) {
        return (...data: any[]) => {
            process.stderr.write(colorFn(Array.from(data).join(" ")) + "\n");
        };
    }

    public setColorfulConsole() {
        console.error = this.logConstructor(colors.red);
        console.warn = this.logConstructor(colors.yellow);
        console.info = this.logConstructor(colors.green);
    }
}
