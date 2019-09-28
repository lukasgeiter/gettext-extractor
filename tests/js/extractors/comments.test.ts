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
        return messages.pop()!.comments;
    }

    function registerTests(commentOptions: ICommentOptions): void {

        function check(source: string, expectedComments: {[P in keyof ICommentOptions]: string[]}, parseOptions?: IJsParseOptions): void {
            let extractedComments = getComments(source, parseOptions);
            let totalCount = 0;

            for (let extractionType of Object.keys(commentOptions)) {
                if ((commentOptions as any)[extractionType] && (expectedComments as any)[extractionType]) {
                    // console.log('checking', extractionType);
                    for (let comment of (expectedComments as any)[extractionType]) {
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

        describe('plain call expression', () => {

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

            test('empty comment', () => {
                check(
                    `
                    /**/
                    getText('Foo');
                `, {});
            });

            test('whitespace comment', () => {
                check(
                    `
                    /*  */
                    getText('Foo');
                `, {});
            });
        });

        describe('jsx', () => {

            test('single line', () => {
                check(`
                    <h1>{/* Leading block comment on same line */ getText('Foo') /* Trailing block comment */}</h1>
                `, {
                    sameLineLeading: ['Leading block comment on same line'],
                    sameLineTrailing: ['Trailing block comment']
                }, {
                    scriptKind: ts.ScriptKind.JSX
                });
            });

            test('separate lines', () => {
                check(`
                    <h1>{
                        // Leading line comment
                        getText('Foo') // Trailing line comment
                    }</h1>
                `, {
                    otherLineLeading: ['Leading line comment'],
                    sameLineTrailing: ['Trailing line comment']
                }, {
                    scriptKind: ts.ScriptKind.JSX
                });
            });
        });

        describe('variable assignment', () => {

            test('single variable', () => {
                check(`
                    // Relevant leading line comment
                    let foo = getText('Foo'); // Relevant trailing line comment
                `, {
                    otherLineLeading: ['Relevant leading line comment'],
                    sameLineTrailing: ['Relevant trailing line comment']
                });
            });

            describe('multiple variables', () => {

                describe('single line', () => {

                    test('line comments', () => {
                        check(`
                            // Irrelevant leading line comment
                            let bar = 42, foo = getText('Foo'); // Irrelevant trailing line comment
                        `, {});
                    });

                    test('block comments', () => {
                        check(`
                            let bar = 42 /* Irrelevant leading block comment */, foo = getText('Foo') /* Relevant trailing block comment */; /* Irrelevant trailing block comment */
                        `, {
                            sameLineTrailing: ['Relevant trailing block comment']
                        });
                    });
                });

                describe('separate lines', () => {

                    test('first line', () => {
                        check(`
                            // Irrelevant leading line comment
                            let foo = getText('Foo'), // Relevant trailing line comment
                                bar = 42; // Irrelevant trailing line comment
                        `, {
                            sameLineTrailing: ['Relevant trailing line comment']
                        });
                    });

                    test('first line with extra whitespace', () => {
                        check(`
                            // Irrelevant leading line comment
                            let foo = getText('Foo')    ,    // Relevant trailing line comment
                                bar = 42; // Irrelevant trailing line comment
                        `, {
                            sameLineTrailing: ['Relevant trailing line comment']
                        });
                    });

                    test('first line with directly relevant block comment', () => {
                        check(`
                            // Irrelevant leading line comment
                            let foo = getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                                bar = 42; // Irrelevant trailing line comment
                        `, {
                            sameLineTrailing: ['Relevant trailing block comment']
                        });
                    });

                    test('second line', () => {
                        check(`
                            // Irrelevant leading line comment
                            let bar = 42, // Irrelevant trailing line comment
                                // Irrelevant leading line comment
                                foo = getText('Foo'); // Relevant trailing line comment
                        `, {
                            sameLineTrailing: ['Relevant trailing line comment']
                        });
                    });

                    test('second line with extra whitespace', () => {
                        check(`
                            // Irrelevant leading line comment
                            let bar = 42, // Irrelevant trailing line comment
                                // Irrelevant leading line comment
                                foo = getText('Foo')    ;    // Relevant trailing line comment
                        `, {
                            sameLineTrailing: ['Relevant trailing line comment']
                        });
                    });

                    test('second line with directly relevant block comment', () => {
                        check(`
                            // Irrelevant leading line comment
                            let bar = 42, // Irrelevant trailing line comment
                                // Irrelevant leading line comment
                                foo = getText('Foo') /* Relevant trailing block comment */; // Irrelevant trailing line comment
                        `, {
                            sameLineTrailing: ['Relevant trailing block comment']
                        });
                    });
                });
            });
        });

        describe('object literal', () => {

            describe('single line', () => {

                test('line comments', () => {
                    check(`(
                        // Irrelevant leading line comment
                        { foo: getText('Foo') } // Irrelevant trailing line comment
                    )`, {});
                });

                test('block comments', () => {
                    check(`(
                        { bar: 42 /* Irrelevant leading block comment */, foo: getText('Foo') /* Relevant trailing block comment */ } /* Irrelevant trailing block comment */
                    )`, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });
            });

            describe('separate lines', () => {

                test('first property', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            // Irrelevant leading line comment
                            foo: getText('Foo'), // Relevant trailing line comment
                            bar: 42 // Irrelevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first property - trailing comma', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            // Irrelevant leading line comment
                            foo: getText('Foo'), // Relevant trailing line comment
                            bar: 42, // Irrelevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first property with extra whitespace', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            // Irrelevant leading line comment
                            foo: getText('Foo')    ,    // Relevant trailing line comment
                            bar: 42 // Irrelevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first property with extra whitespace - trailing comma', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            // Irrelevant leading line comment
                            foo: getText('Foo')    ,    // Relevant trailing line comment
                            bar: 42, // Irrelevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first property with directly relevant block comment', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            // Irrelevant leading line comment 
                            foo: getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                            bar: 42 // Irrelevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });

                test('first property with directly relevant block comment - trailing comma', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            // Irrelevant leading line comment 
                            foo: getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                            bar: 42, // Irrelevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });

                test('second property', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar: 42, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo') // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second property - trailing comma', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar: 42, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo'), // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second property with extra whitespace', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar: 42, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo')    // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second property with extra whitespace - trailing comma', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar: 42, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo')    ,    // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second property with directly relevant block comment', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar: 42, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
                    });
                });

                test('second property with directly relevant block comment - trailing comma', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar: 42, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo'), /* Relevant trailing block comment */ // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
                    });
                });

                test('assignment shorthand', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo') // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('assignment shorthand - trailing comma', () => {
                    check(`(
                        // Irrelevant leading line comment
                        {
                            bar, // Irrelevant trailing line comment
                            // Irrelevant leading line comment
                            foo: getText('Foo'), // Relevant trailing line comment
                        } // Irrelevant trailing line comment
                    )`, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });
            });
        });

        describe('array literal', () => {

            describe('single line', () => {

                test('line comments', () => {
                    check(`(
                        // Irrelevant leading line comment
                        [ getText('Foo') ] // Irrelevant trailing line comment
                    )`, {});
                });

                test('block comments', () => {
                    check(`(
                        [ 'bar' /* Irrelevant leading block comment */, getText('Foo') /* Relevant trailing block comment */ ] /* Irrelevant trailing block comment */
                    )`, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });
            });

            describe('separate lines', () => {

                test('first element', () => {
                    check(`(
                        // Irrelevant leading line comment
                        [
                            // Relevant leading line comment
                            getText('Foo'), // Relevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ] // Irrelevant trailing line comment
                    )`, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first element with extra whitespace', () => {
                    check(`(
                        // Irrelevant leading line comment
                        [
                            // Relevant leading line comment
                            getText('Foo')    ,    // Relevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ] // Irrelevant trailing line comment
                    )`, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first element with directly relevant block comment', () => {
                    check(`(
                        // Irrelevant leading line comment
                        [
                            // Relevant leading line comment
                            getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ] // Irrelevant trailing line comment
                    )`, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });

                test('second element', () => {
                    check(`(
                        // Irrelevant leading line comment
                        [
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo') // Relevant trailing line comment
                        ] // Irrelevant trailing line comment
                    )`, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second element with extra whitespace', () => {
                    check(`(
                        // Irrelevant leading line comment
                        [
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo')    // Relevant trailing line comment
                        ] // Irrelevant trailing line comment
                    )`, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second element with directly relevant block comment', () => {
                    check(`(
                        // Irrelevant leading line comment
                        [
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                        ] // Irrelevant trailing line comment
                    )`, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
                    });
                });
            });
        });

        describe('call expression', () => {

            describe('single line', () => {

                test('line comments', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo(getText('Foo')) // Irrelevant trailing line comment
                    `, {});
                });

                test('block comments', () => {
                    check(`
                        foo('bar' /* Irrelevant leading block comment */, getText('Foo') /* Relevant trailing block comment */) /* Irrelevant trailing block comment */
                    `, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });
            });

            describe('separate lines', () => {

                test('first element', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo(
                            // Relevant leading line comment
                            getText('Foo'), // Relevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first element with extra whitespace', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo(
                            // Relevant leading line comment
                            getText('Foo')    ,    // Relevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first element with directly relevant block comment', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo(
                            // Relevant leading line comment
                            getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });

                test('second element', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo(
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo') // Relevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second element with extra whitespace', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo(
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo')    // Relevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second element with directly relevant block comment', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo(
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
                    });
                });
            });
        });

        describe('new expression', () => {

            describe('single line', () => {

                test('line comments', () => {
                    check(`
                        // Irrelevant leading line comment
                        new Foo(getText('Foo')) // Irrelevant trailing line comment
                    `, {});
                });

                test('block comments', () => {
                    check(`
                        new Foo('bar' /* Irrelevant leading block comment */, getText('Foo') /* Relevant trailing block comment */) /* Irrelevant trailing block comment */
                    `, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });
            });

            describe('separate lines', () => {

                test('first element', () => {
                    check(`
                        // Irrelevant leading line comment
                        new Foo(
                            // Relevant leading line comment
                            getText('Foo'), // Relevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first element with extra whitespace', () => {
                    check(`
                        // Irrelevant leading line comment
                        new Foo(
                            // Relevant leading line comment
                            getText('Foo')    ,    // Relevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first element with directly relevant block comment', () => {
                    check(`
                        // Irrelevant leading line comment
                        new Foo(
                            // Relevant leading line comment
                            getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                            'bar' // Irrelevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });

                test('second element', () => {
                    check(`
                        // Irrelevant leading line comment
                        new Foo(
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo') // Relevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second element with extra whitespace', () => {
                    check(`
                        // Irrelevant leading line comment
                        new Foo(
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo')    // Relevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second element with directly relevant block comment', () => {
                    check(`
                        // Irrelevant leading line comment
                        new Foo(
                            'bar', // Irrelevant trailing line comment
                            // Relevant leading line comment
                            getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                        ) // Irrelevant trailing line comment
                    `, {
                        otherLineLeading: ['Relevant leading line comment'],
                        sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
                    });
                });
            });
        });

        describe('return statement', () => {

            test('single line', () => {
                check(`
                    // Relevant leading line comment
                    return getText('Foo'); // Relevant trailing line comment
                `, {
                    otherLineLeading: ['Relevant leading line comment'],
                    sameLineTrailing: ['Relevant trailing line comment']
                });
            });
        });

        describe('throw statement', () => {

            test('single line', () => {
                check(`
                    // Relevant leading line comment
                    throw getText('Foo'); // Relevant trailing line comment
                `, {
                    otherLineLeading: ['Relevant leading line comment'],
                    sameLineTrailing: ['Relevant trailing line comment']
                });
            });
        });

        describe('parenthesized expression', () => {

            test('single line', () => {
                check(`
                    // Relevant leading line comment
                    (getText('Foo')) // Relevant trailing line comment
                `, {
                    otherLineLeading: ['Relevant leading line comment'],
                    sameLineTrailing: ['Relevant trailing line comment']
                });
            });
        });

        describe('ternary operator', () => {

            describe('single line', () => {

                test('line comments', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo ? getText('Foo') : 'bar'; // Irrelevant trailing line comment
                    `, {});
                });

                test('block comments', () => {
                    check(`
                        foo /* Irrelevant leading block comment */ ? getText('Foo') /* Relevant trailing block comment */ : 'bar'; /* Irrelevant trailing block comment */
                    `, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });
            });

            describe('separate lines', () => {

                test('first expression', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo
                            // Irrelevant leading line comment
                            ? getText('Foo') // Relevant trailing line comment
                            : 'bar'; // Irrelevant trailing line comment
                    `, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first expression with extra whitespace', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo
                            // Irrelevant leading line comment
                            ? getText('Foo')    // Relevant trailing line comment
                            : 'bar'; // Irrelevant trailing line comment
                    `, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('first expression with directly relevant block comment', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo
                            // Irrelevant leading line comment
                            ? getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                            : 'bar'; // Irrelevant trailing line comment
                    `, {
                        sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
                    });
                });

                test('second expression', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo
                            // Irrelevant leading line comment
                            ? 'bar' // Irrelevant trailing line comment
                            : getText('Foo'); // Relevant trailing line comment
                    `, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second expression with extra whitespace', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo
                            // Irrelevant leading line comment
                            ? 'bar' // Irrelevant trailing line comment
                            : getText('Foo')    ;    // Relevant trailing line comment
                    `, {
                        sameLineTrailing: ['Relevant trailing line comment']
                    });
                });

                test('second expression with directly relevant block comment', () => {
                    check(`
                        // Irrelevant leading line comment
                        foo
                            // Irrelevant leading line comment
                            ? 'bar' // Irrelevant trailing line comment
                            : getText('Foo') /* Relevant trailing block comment */; // Irrelevant trailing line comment
                    `, {
                        sameLineTrailing: ['Relevant trailing block comment']
                    });
                });
            });
        });

        describe('complex expressions', () => {

            test('object literal call argument', () => {
                check(`
                    foo({
                        foo: getText('Foo'), // Relevant trailing line comment
                        bar: 42
                    });
                `, {
                    sameLineTrailing: ['Relevant trailing line comment']
                });
            });

            test('array variable assignment', () => {
                check(`
                    // Irrelevant leading line comment
                    let foo = [
                        'bar',
                        getText('Foo') // Relevant trailing line comment
                    ]; // Irrelevant trailing line comment
                `, {
                    sameLineTrailing: ['Relevant trailing line comment']
                });
            });

            test('return ternary', () => {
                check(`
                    // Irrelevant leading line comment
                    return foo
                        ? 'bar'
                        : getText('Foo'); // Relevant trailing line comment
                `, {
                    sameLineTrailing: ['Relevant trailing line comment']
                });
            });
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

        test('with capturing group empty string match', () => {
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
                // Marker: Foo
                // Marker:
                // Marker: Bar
                getText('Foo');
            `)).toEqual([
                'Foo',
                '',
                'Bar'
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
