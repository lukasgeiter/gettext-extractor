import * as ts from 'typescript';

enum CommentEdge {
    Leading,
    Trailing
}

export interface ICommentOptions {
    regex?: RegExp;
    otherLineLeading?: boolean;
    sameLineLeading?: boolean;
    sameLineTrailing?: boolean;
}

export abstract class JsCommentUtils {

    public static extractComments(callExpression: ts.CallExpression, sourceFile: ts.SourceFile, commentOptions?: ICommentOptions): string[] {
        commentOptions = JsCommentUtils.defaultCommentOptions(commentOptions);
        let comments: string[] = [],
            nodeStart = callExpression.parent.getFullStart(),
            nodeEnd = callExpression.parent.getEnd(),
            source = sourceFile.text;

        if (callExpression.parent.kind === ts.SyntaxKind.JsxExpression) {
            nodeStart = callExpression.getFullStart();
            nodeEnd = callExpression.getEnd();

            source = sourceFile.text.slice(0, nodeStart) + '\n' + sourceFile.text.slice(nodeStart);
            nodeEnd++;
        }

        if (commentOptions.otherLineLeading || commentOptions.sameLineLeading) {
            comments = comments.concat(JsCommentUtils.extractCommentsAtPosition(source, nodeStart, CommentEdge.Leading, commentOptions));
        }

        if (commentOptions.sameLineTrailing) {
            comments = comments.concat(JsCommentUtils.extractCommentsAtPosition(source, nodeEnd, CommentEdge.Trailing, commentOptions));
        }

        return comments;
    }

    private static extractCommentsAtPosition(source: string, position: number, edge: CommentEdge, commentOptions: ICommentOptions): string[] {
        let ranges: ts.CommentRange[],
            comments: string[] = [];

        if (edge === CommentEdge.Leading) {
            ranges = ts.getLeadingCommentRanges(source, position);
        } else {
            ranges = ts.getTrailingCommentRanges(source, position);
        }

        for (let range of ranges || []) {
            let commentSource = source.slice(range.pos, range.end),
                comment: string,
                isSameLine = !range.hasTrailingNewLine;

            if (
                edge === CommentEdge.Trailing && commentOptions.sameLineTrailing ||
                edge === CommentEdge.Leading && (
                    isSameLine && commentOptions.sameLineLeading ||
                    !isSameLine && commentOptions.otherLineLeading
                )
            ) {
                if (range.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
                    comment = JsCommentUtils.extractLineComment(commentSource);
                } else {
                    comment = JsCommentUtils.extractBlockComment(commentSource);
                }
            }

            if (comment && commentOptions.regex) {
                let match = comment.match(commentOptions.regex);
                comment = match ? (match[1] || match[0]) : null;
            }

            if (comment) {
                comments.push(comment);
            }
        }

        return comments;
    }

    private static defaultCommentOptions(options: ICommentOptions = {}): ICommentOptions {
        if (options.otherLineLeading === undefined && options.sameLineLeading === undefined && options.sameLineTrailing === undefined) {
            options.otherLineLeading = false;
            options.sameLineLeading = true;
            options.sameLineTrailing = true;
        }
        options.otherLineLeading = !!<any>options.otherLineLeading;
        options.sameLineLeading = !!<any>options.sameLineLeading;
        options.sameLineTrailing = !!<any>options.sameLineTrailing;
        return options;
    }

    private static extractLineComment(source: string): string {
        let match = source.match(/^\/\/\s*(.*?)\s*$/);
        return match ? match[1] : null;
    }

    private static extractBlockComment(source: string): string {
        if (source.indexOf('\n') !== -1) {
            return null;
        }

        let match = source.match(/^\/\*\s*(.*?)\s*\*\/$/);
        return match ? match[1] : null;
    }
}
