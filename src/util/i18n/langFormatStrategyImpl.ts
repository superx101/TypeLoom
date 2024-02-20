import { LangFormatStrategy, LanguageCode } from "./i18nUtil";

import { CodeCofig } from "../../codeGenerator/baseCode";

export class LangFormatStrategyFactory {
    public static create(langCode: LanguageCode): LangFormatStrategy {
        switch (langCode) {
        case LanguageCode.en_us:
            return new USHandleStrategy();
        case LanguageCode.zh_cn:
            return new CNHandleStrategy();
        default:
            return new DefaultFormatStrategy();
        }
    }
}

export class DefaultFormatStrategy implements LangFormatStrategy {
    public formatTexts(lines: string[]): string[] {
        return lines;
    }
}

export class USHandleStrategy implements LangFormatStrategy {
    public formatTexts(lines: string[]): string[] {
        const formattedLines: string[] = [];
        const maxLineLength = CodeCofig.commentMaxLenght;

        for (const line of lines) {
            let currentLine = line.trim();

            while (currentLine.length > maxLineLength) {
                let lastSpaceIndex = currentLine.lastIndexOf(
                    " ",
                    maxLineLength,
                );
                if (lastSpaceIndex === -1)
                    lastSpaceIndex = maxLineLength;

                formattedLines.push(currentLine.slice(0, lastSpaceIndex));
                currentLine = currentLine.slice(lastSpaceIndex + 1);
                currentLine = currentLine.trim();
            }
            if (currentLine.length > 0)
                formattedLines.push(currentLine);
        }

        return formattedLines;
    }
}

export class CNHandleStrategy implements LangFormatStrategy {
    public formatTexts(lines: string[]): string[] {
        return lines;
    }
}
