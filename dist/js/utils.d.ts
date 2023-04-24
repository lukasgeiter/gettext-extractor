import * as ts from 'typescript';
export declare abstract class JsUtils {
    static segmentsMatchPropertyExpression(segments: string[], propertyAccessExpression: ts.PropertyAccessExpression): boolean;
    static calleeNameMatchesCallExpression(calleeName: string, callExpression: ts.CallExpression): boolean;
}
