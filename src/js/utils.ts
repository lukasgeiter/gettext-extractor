import * as ts from 'typescript';

export abstract class JsUtils {

    public static segmentsMatchPropertyExpression(segments: string[], propertyAccessExpression: ts.PropertyAccessExpression): boolean {
        segments = segments.slice();

        if (!(segments.pop() === propertyAccessExpression.name.text)) {
            return false;
        }

        let segment: string | undefined;

        switch (propertyAccessExpression.expression.kind) {
            case ts.SyntaxKind.Identifier:
                segment = segments.pop();
                return (segments.length === 0 || segments.length === 1 && segments[0] === '[this]')
                    && segment === (<ts.Identifier>propertyAccessExpression.expression).text;

            case ts.SyntaxKind.ThisKeyword:
                segment = segments.pop();
                return segments.length === 0 && (segment === 'this' || segment === '[this]');

            case ts.SyntaxKind.PropertyAccessExpression:
                return this.segmentsMatchPropertyExpression(segments, <ts.PropertyAccessExpression>propertyAccessExpression.expression);
        }

        return false;
    }

    public static calleeNameMatchesCallExpression(calleeName: string, callExpression: ts.CallExpression): boolean {
        let segments = calleeName.split('.');

        switch (segments.length) {
            case 0:
                return false;
            case 1:
                return callExpression.expression.kind === ts.SyntaxKind.Identifier
                    && (<ts.Identifier>callExpression.expression).text === segments[0];
            default:
                return callExpression.expression.kind === ts.SyntaxKind.PropertyAccessExpression
                    && this.segmentsMatchPropertyExpression(segments, <ts.PropertyAccessExpression>callExpression.expression);
        }
    }
}
