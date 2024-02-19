import { CodeCofig } from "../../codeGenerator/baseCode";
import { LanguageHandleStrategy } from "../i18nUtil";

export class USHandleStrategy implements LanguageHandleStrategy {
    public formatTexts(lines: string[]): string[] {
        const formattedLines: string[] = [];
        const maxLineLength = CodeCofig.commentMaxLenght;

        for (const line of lines) {
            let currentLine = line.trim();

            while (currentLine.length > maxLineLength) {
                let lastSpaceIndex = currentLine.lastIndexOf(" ", maxLineLength);
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