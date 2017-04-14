import * as ts from 'typescript';

import { Parser, IAddMessageCallback } from '../parser';
import { IMessage } from '../builder';

export type IJsExtractorFunction = (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => void;

export class JsParser extends Parser<IJsExtractorFunction> {

    protected parse(source: string, fileName: string): IMessage[] {
        let sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
        return this.parseNode(sourceFile, sourceFile);
    }

    protected parseNode(node: ts.Node, sourceFile: ts.SourceFile): IMessage[] {
        let messages: IMessage[] = [];
        let addMessageCallback = Parser.createAddMessageCallback(messages, sourceFile.fileName, () => {
            let location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            return location.line + 1;
        });

        for (let extractor of this.extractors) {
            extractor(node, sourceFile, addMessageCallback);
        }

        ts.forEachChild(node, n => {
            messages = messages.concat(this.parseNode(n, sourceFile));
        });

        return messages;
    }
}
