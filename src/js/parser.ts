import * as ts from 'typescript';

import { Parser, IMessageData, IAddMessageCallback } from '../parser';
import { GettextExtractor } from '../extractor';
import { IMessage } from '../builder';

export type IJsExtractorFunction = (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => void;

export class JsParser extends Parser<IJsExtractorFunction> {

    public static createAddMessageCallback(node: ts.Node, sourceFile: ts.SourceFile, messages: IMessage[]): IAddMessageCallback {
        return (data: IMessageData) => {
            let references: string[];

            if (typeof data.lineNumber !== 'number') {
                let location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                data.lineNumber = location.line + 1;
            }

            data.fileName = data.fileName || sourceFile.fileName;

            if (data.fileName && data.lineNumber && data.fileName !== GettextExtractor.STRING_LITERAL_FILENAME) {
                references = [`${data.fileName}:${data.lineNumber}`];
            }

            let message: IMessage = {
                text: data.text,
                textPlural: data.textPlural || undefined,
                context: data.context || undefined,
                references: references,
                comments: data.comments && data.comments.length ? data.comments : undefined
            };

            messages.push(message);
        };
    }

    protected parse(source: string, fileName: string): void {
        let sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
        let messages = this.parseNode(sourceFile, sourceFile);
        for (let message of messages) {
            this.builder.addMessage(message);
        }

        this.stats && this.stats.numberOfParsedFiles++;
        if (messages.length) {
            this.stats && this.stats.numberOfParsedFilesWithMessages++;
        }
    }

    protected parseNode(node: ts.Node, sourceFile: ts.SourceFile): IMessage[] {
        let messages: IMessage[] = [];
        let addMessageCallback = JsParser.createAddMessageCallback(node, sourceFile, messages);

        for (let extractor of this.extractors) {
            extractor(node, sourceFile, addMessageCallback);
        }

        ts.forEachChild(node, n => {
            messages = messages.concat(this.parseNode(n, sourceFile));
        });

        return messages;
    }
}
