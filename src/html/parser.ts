import * as parse5 from 'parse5';

import { Parser, IAddMessageCallback, IParseOptions } from '../parser';
import { IMessage } from '../builder';

export type Node = parse5.DefaultTreeNode;
export type TextNode = parse5.DefaultTreeTextNode;
export type Element = parse5.DefaultTreeElement;

export type IHtmlExtractorFunction = (node: Node, source: string, fileName: string, addMessage: IAddMessageCallback) => void;

export class HtmlParser extends Parser<IHtmlExtractorFunction, IParseOptions> {

    protected parse(source: string, fileName: string, options: IParseOptions = {}): IMessage[] {
        let document = parse5.parse(source, {sourceCodeLocationInfo: true});
        return this.parseNode(document, source, fileName, options.lineNumberStart || 1);
    }

    protected parseNode(node: any, source: string, fileName: string, lineNumberStart: number): IMessage[] {
        let messages: IMessage[] = [];
        let addMessageCallback = Parser.createAddMessageCallback(messages, fileName, () => {
            if (node.sourceCodeLocation && node.sourceCodeLocation.startLine) {
                return lineNumberStart + node.sourceCodeLocation.startLine - 1;
            }
        });

        for (let extractor of this.extractors) {
            extractor(node, source, fileName, addMessageCallback);
        }

        let childNodes = node.content ? node.content.childNodes : node.childNodes;
        if (childNodes) {
            for (let n of childNodes) {
                messages = messages.concat(this.parseNode(n, source, fileName, lineNumberStart));
            }
        }

        return messages;
    }
}
