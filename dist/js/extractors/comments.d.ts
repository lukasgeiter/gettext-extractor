import * as ts from 'typescript';
export interface ICommentOptions {
    regex?: RegExp;
    otherLineLeading?: boolean;
    sameLineLeading?: boolean;
    sameLineTrailing?: boolean;
}
export declare abstract class JsCommentUtils {
    static extractComments(callExpression: ts.CallExpression, sourceFile: ts.SourceFile, commentOptions?: ICommentOptions): string[];
    private static getExtractionPositions;
    private static nodeIsOnSeparateLine;
    private static extractCommentsAtPosition;
    private static defaultCommentOptions;
    private static extractLineComment;
    private static extractBlockComment;
}
