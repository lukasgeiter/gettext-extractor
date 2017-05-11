import * as ts from 'typescript';
import { JsUtils } from '../../src/js/utils';

describe('JS: Utils', () => {

    describe('segmentsMatchPropertyExpression', () => {

        function getExpression(source: string): ts.PropertyAccessExpression {
            let sourceFile = ts.createSourceFile('foo.ts', source, ts.ScriptTarget.Latest, true);

            return <ts.PropertyAccessExpression>sourceFile.getChildAt(0).getChildAt(0).getChildAt(0);
        }

        test('standard case', () => {
            let segments = ['foo', 'bar'];

            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('foo.bar'))).toBe(true);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('bar.foo'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('this.foo.bar'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('baz.foo.bar'))).toBe(false);
        });

        test('long path', () => {
            let segments = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('one.two.three.four.five.six.seven.eight.nine.ten'))).toBe(true);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('two.three.four.five.six.seven.eight.nine.ten'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('one.two.three.four.five.six.seven.eight.nine'))).toBe(false);
        });

        test('this keyword', () => {
            let segments = ['this', 'foo', 'bar'];

            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('this.foo.bar'))).toBe(true);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('foo.bar'))).toBe(false);
        });

        test('optional this keyword', () => {
            let segments = ['[this]', 'foo', 'bar'];

            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('this.foo.bar'))).toBe(true);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('foo.bar'))).toBe(true);
        });

        test('this keyword not at first position', () => {
            let segments = ['foo', 'this', 'bar'];

            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('foo.this.bar'))).toBe(true);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('this.foo.this.bar'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('this.foo.bar'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(segments, getExpression('this.bar'))).toBe(false);
        });

        test('case sensitivity', () => {
            expect(JsUtils.segmentsMatchPropertyExpression(['this', 'foo'], getExpression('this.FOO'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(['this', 'foo'], getExpression('THIS.foo'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(['THIS', 'foo'], getExpression('this.foo'))).toBe(false);
            expect(JsUtils.segmentsMatchPropertyExpression(['THIS', 'foo'], getExpression('THIS.foo'))).toBe(true);
        });
    });
});
