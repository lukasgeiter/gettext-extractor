import * as ts from 'typescript';
import { Parser, IAddMessageCallback, IParseOptions } from '../parser';
import { IMessage } from '../builder';
export declare type IJsExtractorFunction = (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => void;
export interface IJsParseOptions extends IParseOptions {
    scriptKind?: ts.ScriptKind;
}
export declare class JsParser extends Parser<IJsExtractorFunction, IJsParseOptions> {
    protected parse(source: string, fileName: string, options?: IJsParseOptions): IMessage[];
    protected parseNode(node: ts.Node, sourceFile: ts.SourceFile, lineNumberStart: number): IMessage[];
}
