import * as ts from 'typescript';

import { CatalogBuilder, IMessage } from '../../../src/builder';
import { JsParser, IJsParseOptions } from '../../../src/js/parser';
import { callExpressionExtractor } from '../../../src/js/extractors/factories/callExpression';
import { ICommentOptions } from '../../../src/js/extractors/comments';

describe('JS: comments', () => {

    let builder: CatalogBuilder,
        messages: IMessage[],
        parser: JsParser;

    beforeEach(() => {
        messages = [];

        builder = <any>{
            stats: {},
            addMessage: jest.fn((message: IMessage) => {
                messages.push(message);
            })
        };
    });

    function getComments(source: string, options?: IJsParseOptions): string[] {
        parser.parseString(source, undefined, options);
        return messages.pop().comments;
    }

    function registerTests(commentOptions: ICommentOptions): void {

        function check(source: string, expectedComments: {[P in keyof ICommentOptions]: string[]}, parseOptions?: IJsParseOptions): void {
            let extractedComments = getComments(source, parseOptions);
            let totalCount = 0;

            for (let extractionType of Object.keys(commentOptions)) {
                if (commentOptions[extractionType] && expectedComments[extractionType]) {
                    // console.log('checking', extractionType);
                    for (let comment of expectedComments[extractionType]) {
                        expect(extractedComments).toContain(comment);
                        totalCount++;
                    }
                }
            }

            if (totalCount === 0) {
                expect(extractedComments).toBeUndefined();
            } else {
                expect(extractedComments.length).toBe(totalCount);
            }
        }

        beforeEach(() => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: commentOptions
                })
            ]);
        });

        test('leading line and trailing line', () => {
            check(`
                // Leading line comment
                getText('Foo'); // Trailing line comment
            `, {
                otherLineLeading: ['Leading line comment'],
                sameLineTrailing: ['Trailing line comment']
            });
        });

        test('two leading line', () => {
            check(`
                // Leading line comment 1/2
                // Leading line comment 2/2
                getText('Foo');
            `, {
                otherLineLeading: ['Leading line comment 1/2', 'Leading line comment 2/2']
            });
        });

        test('leading line with space', () => {
            check(`
                // Leading line comment with space
    
                getText('Foo');
            `, {
                otherLineLeading: ['Leading line comment with space']
            });
        });

        test('leading block and trailing block', () => {
            check(`
                /* Leading block comment */
                getText('Foo'); /* Trailing block comment */
            `, {
                otherLineLeading: ['Leading block comment'],
                sameLineTrailing: ['Trailing block comment']
            });
        });

        test('two leading block', () => {
            check(`
                /* Leading block comment 1/2 */
                /* Leading block comment 2/2 */
                getText('Foo');
            `, {
                otherLineLeading: ['Leading block comment 1/2', 'Leading block comment 2/2']
            });
        });

        test('leading block with space', () => {
            check(`
                /* Leading block comment with space */
    
                getText('Foo');
            `, {
                otherLineLeading: ['Leading block comment with space']
            });
        });

        test('leading block same line', () => {
            check(`
                /* Leading block comment on same line */ getText('Foo');
            `, {
                sameLineLeading: ['Leading block comment on same line']
            });
        });

        test('two leading block same line', () => {
            check(`
                /* Leading block comment on same line 1/2 */ /* Leading block comment on same line 2/2 */ getText('Foo');
            `, {
                sameLineLeading: ['Leading block comment on same line 1/2', 'Leading block comment on same line 2/2']
            });
        });

        test('two trailing block', () => {
            check(`
                getText('Foo'); /* Trailing block comment 1/2 */ /* Trailing block comment 2/2 */
            `, {
                sameLineTrailing: ['Trailing block comment 1/2', 'Trailing block comment 2/2']
            });
        });

        test('mixed', () => {
            check(`
                /* Marker: Leading block comment */
                // Leading line comment
                /* Leading block comment on same line */ getText('Foo'); /* Trailing block comment */ // Marker: Trailing line comment
            `, {
                otherLineLeading: ['Marker: Leading block comment', 'Leading line comment'],
                sameLineLeading: ['Leading block comment on same line'],
                sameLineTrailing: ['Trailing block comment', 'Marker: Trailing line comment']
            });
        });

        test('multi line', () => {
            check(`
                /* Leading multi
                line comment */
                getText('Foo'); /* Trailing multi
                line comment */
            `, {});
        });

        test('jsx block', () => {
            check(`
                return <h1>{/* Leading block comment on same line */ getText('Foo') /* Trailing block comment */}</h1>;
            `, {
                sameLineLeading: ['Leading block comment on same line'],
                sameLineTrailing: ['Trailing block comment']
            }, { scriptKind: ts.ScriptKind.JSX });
        });

        test('jsx line', () => {
            check(`
                return <h1>{
                    // Leading line comment
                    getText('Foo') // Trailing line comment
                }</h1>;
            `, {
                otherLineLeading: ['Leading line comment'],
                sameLineTrailing: ['Trailing line comment']
            }, { scriptKind: ts.ScriptKind.JSX });
        });
    }

    describe('all', () => {

        registerTests({
            otherLineLeading: true,
            sameLineLeading: true,
            sameLineTrailing: true
        });
    });

    describe('same line', () => {

        registerTests({
            sameLineLeading: true,
            sameLineTrailing: true
        });
    });

    describe('only trailing', () => {

        registerTests({
            sameLineTrailing: true
        });
    });

    describe('all leading', () => {

        registerTests({
            otherLineLeading: true,
            sameLineLeading: true
        });
    });

    describe('only same line leading', () => {

        registerTests({
            sameLineLeading: true
        });
    });

    describe('only other line leading', () => {

        registerTests({
            otherLineLeading: true
        });
    });

    describe('regex', () => {

        test('with capturing group', () => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        regex: /^Marker:\s*(.*)$/,
                        otherLineLeading: true,
                        sameLineTrailing: true
                    }
                })
            ]);

            expect(getComments(`
                /* Marker: Leading block comment */
                // Leading line comment
                /* Leading block comment on same line */ getText('Foo'); /* Trailing block comment */ // Marker: Trailing line comment
            `)).toEqual([
                'Leading block comment',
                'Trailing line comment'
            ]);
        });

        test('without capturing group', () => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        regex: /^Marker:\s*.*$/,
                        otherLineLeading: true,
                        sameLineTrailing: true
                    }
                })
            ]);

            expect(getComments(`
                /* Marker: Leading block comment */
                // Leading line comment
                /* Leading block comment on same line */ getText('Foo'); /* Trailing block comment */ // Marker: Trailing line comment
            `)).toEqual([
                'Marker: Leading block comment',
                'Marker: Trailing line comment'
            ]);
        });
    });
});
