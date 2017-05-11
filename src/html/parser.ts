import * as parse5 from 'parse5';

import { Parser, IAddMessageCallback, IParseOptions } from '../parser';
import { IMessage } from '../builder';

export type Node = parse5.AST.Default.Node;
export type TextNode = parse5.AST.Default.TextNode;
export type Element = parse5.AST.Default.Element;

export type IHtmlExtractorFunction = (node: Node, fileName: string, addMessage: IAddMessageCallback) => void;

export class HtmlParser extends Parser<IHtmlExtractorFunction, IParseOptions> {

    protected parse(source: string, fileName: string, options: IParseOptions = {}): IMessage[] {
        let document = parse5.parse(source, {locationInfo: true});
        return this.parseNode(document, fileName, options.lineNumberStart || 1);
    }

    protected parseNode(node: any, fileName: string, lineNumberStart: number): IMessage[] {
        let messages: IMessage[] = [];
        let addMessageCallback = Parser.createAddMessageCallback(messages, fileName, () => {
            if (node.__location && node.__location.line) {
                return lineNumberStart + node.__location.line - 1;
            }
        });

        for (let extractor of this.extractors) {
            extractor(node, fileName, addMessageCallback);
        }

        if (node.childNodes) {
            for (let n of node.childNodes) {
                messages = messages.concat(this.parseNode(n, fileName, lineNumberStart));
            }
        }

        return messages;
    }
}
