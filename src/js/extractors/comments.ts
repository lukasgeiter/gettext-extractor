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
            { start, end } = this.getExtractionPositions(callExpression, sourceFile),
            source = sourceFile.text;

        if (callExpression.parent.kind === ts.SyntaxKind.JsxExpression) {
            source = source.slice(0, start) + '\n' + source.slice(start);
            end++;
        }

        if (commentOptions.otherLineLeading || commentOptions.sameLineLeading) {
            comments = comments.concat(JsCommentUtils.extractCommentsAtPosition(source, start, CommentEdge.Leading, commentOptions));
        }

        if (commentOptions.sameLineTrailing) {
            comments = comments.concat(JsCommentUtils.extractCommentsAtPosition(source, end, CommentEdge.Trailing, commentOptions));
        }

        return comments;
    }

    private static getExtractionPositions(node: ts.Node, sourceFile: ts.SourceFile): {start: number, end: number} {

        let start = node.getFullStart(),
            end = node.getEnd();

        function skipToCharacter(character: number): void {
            scan: while (end < sourceFile.text.length) {
                switch (sourceFile.text.charCodeAt(end)) {
                    case character:
                        end++;
                        break scan;
                    case 9: // tab
                    case 11: // verticalTab
                    case 12: // formFeed
                    case 32: // space
                        end++;
                        break;
                    default:
                        break scan;
                }
            }
        }

        function skipToSemicolon(): void {
            skipToCharacter(59);
        }

        function skipToComma(): void {
            skipToCharacter(44);
        }

        switch (node.parent.kind) {
            case ts.SyntaxKind.ReturnStatement:
            case ts.SyntaxKind.ThrowStatement:
            case ts.SyntaxKind.ExpressionStatement:
            case ts.SyntaxKind.ParenthesizedExpression:
            case ts.SyntaxKind.BinaryExpression:
                return this.getExtractionPositions(node.parent, sourceFile);

            case ts.SyntaxKind.VariableDeclaration:
                if (node.parent.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
                    let variableDeclarationList = (<ts.VariableDeclarationList>node.parent.parent);
                    if (variableDeclarationList.declarations.length === 1) {
                        return this.getExtractionPositions(variableDeclarationList.parent, sourceFile);
                    } else {
                        if (this.nodeIsOnSeparateLine(node, variableDeclarationList.declarations.map(d => d.initializer ?? d.name) as ReadonlyArray<ts.Node>, sourceFile)) {
                            if (variableDeclarationList.declarations[variableDeclarationList.declarations.length - 1].initializer === node) {
                                skipToSemicolon();
                            } else {
                                skipToComma();
                            }
                        }
                    }
                }
                break;

            case ts.SyntaxKind.CallExpression:
            case ts.SyntaxKind.NewExpression:
                if (this.nodeIsOnSeparateLine(node, (<ts.CallExpression|ts.NewExpression>node.parent).arguments as ReadonlyArray<ts.Node>, sourceFile)) {
                    skipToComma();
                }
                break;

            case ts.SyntaxKind.PropertyAssignment:
                if (node.parent.parent.kind === ts.SyntaxKind.ObjectLiteralExpression
                    && this.nodeIsOnSeparateLine(node.parent, (<ts.ObjectLiteralExpression>node.parent.parent).properties, sourceFile)) {
                    skipToComma();
                }
                break;

            case ts.SyntaxKind.ArrayLiteralExpression:
                if (this.nodeIsOnSeparateLine(node, (<ts.ArrayLiteralExpression>node.parent).elements, sourceFile)) {
                    skipToComma();
                }
                break;

            case ts.SyntaxKind.ConditionalExpression:
                if ((<ts.ConditionalExpression>node.parent).whenFalse === node) {
                    skipToSemicolon();
                }
                break;
        }

        return { start, end };
    }

    private static nodeIsOnSeparateLine(node: ts.Node, nodes: ReadonlyArray<ts.Node>, sourceFile: ts.SourceFile): boolean {
        let index = nodes.indexOf(node);
        if (index === -1) {
            return false;
        }

        let lineNumber = sourceFile.getLineAndCharacterOfPosition(nodes[index].getStart()).line;
        if (index > 0) {
            if (lineNumber === sourceFile.getLineAndCharacterOfPosition(nodes[index - 1].getEnd()).line) {
                return false;
            }
        }
        if (index + 1 < nodes.length) {
            if (lineNumber === sourceFile.getLineAndCharacterOfPosition(nodes[index + 1].getStart()).line) {
                return false;
            }
        }
        return true;
    }

    private static extractCommentsAtPosition(source: string, position: number, edge: CommentEdge, commentOptions: ICommentOptions): string[] {
        let ranges: ts.CommentRange[] | undefined,
            comments: string[] = [];

        if (edge === CommentEdge.Leading) {
            ranges = ts.getLeadingCommentRanges(source, position);
        } else {
            ranges = ts.getTrailingCommentRanges(source, position);
        }

        for (let range of ranges || []) {
            let commentSource = source.slice(range.pos, range.end),
                comment: string | null | undefined,
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

            if (comment) {
                if (commentOptions.regex) {
                    let match = comment.match(commentOptions.regex);
                    if (match) {
                        comments.push(match[1] !== undefined ? match[1] : match[0]);
                    }
                } else {
                    comments.push(comment);
                }
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

    private static extractLineComment(source: string): string | null {
        let match = source.match(/^\/\/\s*(.*?)\s*$/);
        return match ? match[1] : null;
    }

    private static extractBlockComment(source: string): string | null {
        if (source.indexOf('\n') !== -1) {
            return null;
        }

        let match = source.match(/^\/\*\s*(.*?)\s*\*\/$/);
        return match ? match[1] : null;
    }
}
