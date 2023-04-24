import * as parse5 from 'parse5';
import { Parser, IAddMessageCallback, IParseOptions } from '../parser';
import { IMessage } from '../builder';
export declare type Node = parse5.DefaultTreeNode;
export declare type TextNode = parse5.DefaultTreeTextNode;
export declare type Element = parse5.DefaultTreeElement;
export declare type IHtmlExtractorFunction = (node: Node, fileName: string, addMessage: IAddMessageCallback, lineNumberStart: number) => void;
export declare class HtmlParser extends Parser<IHtmlExtractorFunction, IParseOptions> {
    protected parse(source: string, fileName: string, options?: IParseOptions): IMessage[];
    protected parseNode(node: any, fileName: string, lineNumberStart: number): IMessage[];
}
