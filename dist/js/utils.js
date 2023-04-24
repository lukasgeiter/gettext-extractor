"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsUtils = void 0;
const ts = require("typescript");
class JsUtils {
    static segmentsMatchPropertyExpression(segments, propertyAccessExpression) {
        segments = segments.slice();
        if (!(segments.pop() === propertyAccessExpression.name.text)) {
            return false;
        }
        let segment;
        switch (propertyAccessExpression.expression.kind) {
            case ts.SyntaxKind.Identifier:
                segment = segments.pop();
                return (segments.length === 0 || segments.length === 1 && segments[0] === '[this]')
                    && segment === propertyAccessExpression.expression.text;
            case ts.SyntaxKind.ThisKeyword:
                segment = segments.pop();
                return segments.length === 0 && (segment === 'this' || segment === '[this]');
            case ts.SyntaxKind.PropertyAccessExpression:
                return this.segmentsMatchPropertyExpression(segments, propertyAccessExpression.expression);
        }
        return false;
    }
    static calleeNameMatchesCallExpression(calleeName, callExpression) {
        let segments = calleeName.split('.');
        switch (segments.length) {
            case 0:
                return false;
            case 1:
                return callExpression.expression.kind === ts.SyntaxKind.Identifier
                    && callExpression.expression.text === segments[0];
            default:
                return callExpression.expression.kind === ts.SyntaxKind.PropertyAccessExpression
                    && this.segmentsMatchPropertyExpression(segments, callExpression.expression);
        }
    }
}
exports.JsUtils = JsUtils;
