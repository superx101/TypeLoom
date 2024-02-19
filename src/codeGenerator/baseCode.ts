import { Data, SingletonProperty } from "../util/classDecorator";

export class CodeCofig {
    public static indentSize: number = 4;
    public static newline: string = "\r\n";
    public static commentMaxLenght: number = 80;
}

export interface StringOptions {
    prefix?: string;
    suffix?: string;
}

export interface Code {
    toString(depth?: number): string;
}

@Data
export class Commentable {
    constructor(protected comment?: Code) {}
}

export interface Commentable {
    getComment(): Code;
    setComment(comment: Code): void;
}

export class CodeUtil {
    @SingletonProperty
    public static readonly instance: CodeUtil;

    public arrToLines(
        strArr: (string | undefined)[],
        depth?: number,
        newLine: boolean = true,
    ): string {
        let result = "";
        const indent = CodeUtil.instance.getIndent(depth);
        for (const str of strArr) {
            if (str == null || str === "")
                continue;
            const line = depth ? indent + str : str;
            result += line + CodeCofig.newline;
        }
        if (!newLine)
            result = result.slice(0, -CodeCofig.newline.length);
        return result;
    }

    public getIndent(depth?: number) {
        return " ".repeat(CodeCofig.indentSize).repeat(depth || 0);
    }
}

export class Statement extends Commentable implements Code {
    constructor(
        protected items: string[],
        comment?: Code,
    ) {
        super(comment);
    }

    public itemsToString() {
        return this.items.join(" ");
    }

    public toString(
        depth?: number,
        options: StringOptions = { prefix: "", suffix: "" },
    ): string {
        const indent = CodeUtil.instance.getIndent(depth);
        const contentText = this.itemsToString();
        const commentText = this.comment?.toString(depth);
        return CodeUtil.instance.arrToLines([
            commentText,
            indent + options.prefix + contentText + options.suffix,
        ]);
    }
}

export class CodeBlock extends Commentable implements Code {
    protected startText: string = "";
    protected endText: string = "";

    constructor(
        protected header: Statement,
        protected contents: Code[],
        comment?: Code,
    ) {
        super(comment);
    }

    protected getContentsString(depth?: number): string {
        return this.contents
            .map((s) => s.toString(depth))
            .join("")
            .slice(0, -CodeCofig.newline.length);
    }

    public toString(
        depth?: number,
        options: StringOptions = { prefix: "", suffix: "" },
    ): string {
        if (depth == null || depth < 0)
            return this.getContentsString(0);
        const indent = CodeUtil.instance.getIndent(depth);
        const contentWithIndent =
            this.header?.toString(depth, {
                prefix: options.prefix,
                suffix: "" + this.startText,
            }) + this.getContentsString(depth + 1);
        return CodeUtil.instance.arrToLines([
            this.comment?.toString(depth),
            contentWithIndent,
            indent + this.endText,
        ]);
    }
}
