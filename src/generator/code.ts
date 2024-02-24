import { Data, SingletonProperty } from "../util/classDecorator";

export class CodeCofig {
    @SingletonProperty
    public static readonly instance: CodeCofig;

    public readonly supportedLanguages: string[] = ["ts"];
    public indentSize: number = 4;
    public newline: string = "\r\n";
    public commentMaxLenght: number = 80;
}

export interface StringOptions {
    prefix?: string;
    suffix?: string;
}

export interface CodeRender {
    renderCode(depth?: number): string;
}

@Data
export class Commentable {
    constructor(protected comment?: CodeRender) {}
}

export interface Commentable {
    getComment(): CodeRender;
    setComment(comment: CodeRender): void;
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
            result += line + CodeCofig.instance.newline;
        }
        if (!newLine)
            result = result.slice(0, -CodeCofig.instance.newline.length);
        return result;
    }

    public getIndent(depth?: number) {
        return " ".repeat(CodeCofig.instance.indentSize).repeat(depth || 0);
    }
}

export class StatementRender extends Commentable implements CodeRender {
    constructor(
        protected items: string[],
        comment?: CodeRender,
    ) {
        super(comment);
    }

    public randerItems() {
        return this.items.filter((i) => i != "").join(" ");
    }

    public renderCode(
        depth?: number,
        options: StringOptions = { prefix: "", suffix: "" },
    ): string {
        const indent = CodeUtil.instance.getIndent(depth);
        const contentText = this.randerItems();
        const commentText = this.comment?.renderCode(depth);
        return CodeUtil.instance.arrToLines([
            commentText,
            indent + options.prefix + contentText + options.suffix,
        ]);
    }
}

export class BlockRender extends Commentable implements CodeRender {
    protected startText: string = "";
    protected endText: string = "";

    constructor(
        protected header: StatementRender,
        protected contents: CodeRender[],
        comment?: CodeRender,
    ) {
        super(comment);
    }

    protected getContentsString(depth?: number): string {
        return this.contents
            .map((s) => s.renderCode(depth))
            .join("")
            .slice(0, -CodeCofig.instance.newline.length);
    }

    public renderCode(
        depth?: number,
        options: StringOptions = { prefix: "", suffix: "" },
    ): string {
        if (depth == null || depth < 0)
            return this.getContentsString(0);

        const indent = CodeUtil.instance.getIndent(depth);
        const headerText = this.header?.renderCode(depth, {
            prefix: options.prefix,
            suffix: "" + this.startText,
        }).slice(0, -CodeCofig.instance.newline.length);
        const contentText = this.getContentsString(depth + 1);
        const commentText = this.comment?.renderCode(depth);

        if (contentText === "")
            return CodeUtil.instance.arrToLines([
                commentText,
                headerText + this.endText,
            ]);
        return CodeUtil.instance.arrToLines([
            commentText,
            headerText,
            contentText,
            indent + this.endText,
        ]);
    }
}
