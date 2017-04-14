import * as parse5 from 'parse5';

import { Parser, IAddMessageCallback } from '../parser';
import { IMessage } from '../builder';

export type Node = parse5.AST.Default.Node;

export type IHtmlExtractorFunction = (node: Node, fileName: string, addMessage: IAddMessageCallback) => void;

export class HtmlParser extends Parser<IHtmlExtractorFunction> {

    protected parse(source: string, fileName: string): IMessage[] {
        let document = parse5.parse(source, {locationInfo: true});
        return this.parseNode(document, fileName);
    }

    protected parseNode(node: any, fileName: string): IMessage[] {
        let messages: IMessage[] = [];
        let addMessageCallback = Parser.createAddMessageCallback(messages, fileName, () => {
            return node.__location && node.__location.line;
        });

        for (let extractor of this.extractors) {
            extractor(node, fileName, addMessageCallback);
        }

        if (node.childNodes) {
            for (let n of node.childNodes) {
                messages = messages.concat(this.parseNode(n, fileName));
            }
        }

        return messages;
    }
}
