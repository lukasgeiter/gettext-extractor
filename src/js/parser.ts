import * as ts from 'typescript';

import { Parser, IAddMessageCallback, IParseOptions } from '../parser';
import { IMessage } from '../builder';

export type IJsExtractorFunction = (node: ts.Node, source: string, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => void;

export interface IJsParseOptions extends IParseOptions {
    scriptKind?: ts.ScriptKind;
}

export class JsParser extends Parser<IJsExtractorFunction, IJsParseOptions> {

    protected parse(source: string, fileName: string, options: IJsParseOptions = {}): IMessage[] {
        let sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, options.scriptKind);
        return this.parseNode(sourceFile, source, sourceFile, options.lineNumberStart || 1);
    }

    protected parseNode(node: ts.Node, source: string, sourceFile: ts.SourceFile, lineNumberStart: number): IMessage[] {
        let messages: IMessage[] = [];
        let addMessageCallback = Parser.createAddMessageCallback(messages, sourceFile.fileName, () => {
            let location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            return lineNumberStart + location.line;
        });

        for (let extractor of this.extractors) {
            extractor(node, source, sourceFile, addMessageCallback);
        }

        ts.forEachChild(node, n => {
            messages = messages.concat(this.parseNode(n, source, sourceFile, lineNumberStart));
        });

        return messages;
    }
}
