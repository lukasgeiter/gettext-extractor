"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsCommentUtils = void 0;
const ts = require("typescript");
var CommentEdge;
(function (CommentEdge) {
    CommentEdge[CommentEdge["Leading"] = 0] = "Leading";
    CommentEdge[CommentEdge["Trailing"] = 1] = "Trailing";
})(CommentEdge || (CommentEdge = {}));
class JsCommentUtils {
    static extractComments(callExpression, sourceFile, commentOptions) {
        commentOptions = JsCommentUtils.defaultCommentOptions(commentOptions);
        let comments = [], { start, end } = this.getExtractionPositions(callExpression, sourceFile), source = sourceFile.text;
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
    static getExtractionPositions(node, sourceFile) {
        let start = node.getFullStart(), end = node.getEnd();
        function skipToCharacter(character) {
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
        function skipToSemicolon() {
            skipToCharacter(59);
        }
        function skipToComma() {
            skipToCharacter(44);
        }
        switch (node.parent.kind) {
            case ts.SyntaxKind.ReturnStatement:
            case ts.SyntaxKind.ThrowStatement:
            case ts.SyntaxKind.ExpressionStatement:
            case ts.SyntaxKind.ParenthesizedExpression:
                return this.getExtractionPositions(node.parent, sourceFile);
            case ts.SyntaxKind.VariableDeclaration:
                if (node.parent.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
                    let variableDeclarationList = node.parent.parent;
                    if (variableDeclarationList.declarations.length === 1) {
                        return this.getExtractionPositions(variableDeclarationList.parent, sourceFile);
                    }
                    else {
                        if (this.nodeIsOnSeparateLine(node, variableDeclarationList.declarations.map(d => { var _a; return (_a = d.initializer) !== null && _a !== void 0 ? _a : d.name; }), sourceFile)) {
                            if (variableDeclarationList.declarations[variableDeclarationList.declarations.length - 1].initializer === node) {
                                skipToSemicolon();
                            }
                            else {
                                skipToComma();
                            }
                        }
                    }
                }
                break;
            case ts.SyntaxKind.CallExpression:
            case ts.SyntaxKind.NewExpression:
                if (this.nodeIsOnSeparateLine(node, node.parent.arguments, sourceFile)) {
                    skipToComma();
                }
                break;
            case ts.SyntaxKind.PropertyAssignment:
                if (node.parent.parent.kind === ts.SyntaxKind.ObjectLiteralExpression
                    && this.nodeIsOnSeparateLine(node.parent, node.parent.parent.properties, sourceFile)) {
                    skipToComma();
                }
                break;
            case ts.SyntaxKind.ArrayLiteralExpression:
                if (this.nodeIsOnSeparateLine(node, node.parent.elements, sourceFile)) {
                    skipToComma();
                }
                break;
            case ts.SyntaxKind.ConditionalExpression:
                if (node.parent.whenFalse === node) {
                    skipToSemicolon();
                }
                break;
        }
        return { start, end };
    }
    static nodeIsOnSeparateLine(node, nodes, sourceFile) {
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
    static extractCommentsAtPosition(source, position, edge, commentOptions) {
        let ranges, comments = [];
        if (edge === CommentEdge.Leading) {
            ranges = ts.getLeadingCommentRanges(source, position);
        }
        else {
            ranges = ts.getTrailingCommentRanges(source, position);
        }
        for (let range of ranges || []) {
            let commentSource = source.slice(range.pos, range.end), comment, isSameLine = !range.hasTrailingNewLine;
            if (edge === CommentEdge.Trailing && commentOptions.sameLineTrailing ||
                edge === CommentEdge.Leading && (isSameLine && commentOptions.sameLineLeading ||
                    !isSameLine && commentOptions.otherLineLeading)) {
                if (range.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
                    comment = JsCommentUtils.extractLineComment(commentSource);
                }
                else {
                    comment = JsCommentUtils.extractBlockComment(commentSource);
                }
            }
            if (comment) {
                if (commentOptions.regex) {
                    let match = comment.match(commentOptions.regex);
                    if (match) {
                        comments.push(match[1] !== undefined ? match[1] : match[0]);
                    }
                }
                else {
                    comments.push(comment);
                }
            }
        }
        return comments;
    }
    static defaultCommentOptions(options = {}) {
        if (options.otherLineLeading === undefined && options.sameLineLeading === undefined && options.sameLineTrailing === undefined) {
            options.otherLineLeading = false;
            options.sameLineLeading = true;
            options.sameLineTrailing = true;
        }
        options.otherLineLeading = !!options.otherLineLeading;
        options.sameLineLeading = !!options.sameLineLeading;
        options.sameLineTrailing = !!options.sameLineTrailing;
        return options;
    }
    static extractLineComment(source) {
        let match = source.match(/^\/\/\s*(.*?)\s*$/);
        return match ? match[1] : null;
    }
    static extractBlockComment(source) {
        if (source.indexOf('\n') !== -1) {
            return null;
        }
        let match = source.match(/^\/\*\s*(.*?)\s*\*\/$/);
        return match ? match[1] : null;
    }
}
exports.JsCommentUtils = JsCommentUtils;
