import { ICommentOptions } from '../../../dist/js/extractors/comments';
import { GettextExtractor, JsExtractors } from '../../../dist';
import { IJsParseOptions } from '../../../dist/js/parser';
import { ScriptKind } from 'typescript';
import { trimIndent } from '../../indent';

describe('plain call expression', () => {

    describe('leading line and trailing line', assertComments(
        `
            // Leading line comment
            getText('Foo'); // Trailing line comment
        `,
        {
            otherLineLeading: ['Leading line comment'],
            sameLineTrailing: ['Trailing line comment']
        }
    ));

    describe('two leading line', assertComments(
        `
            // Leading line comment 1/2
            // Leading line comment 2/2
            getText('Foo');
        `,
        {
            otherLineLeading: ['Leading line comment 1/2', 'Leading line comment 2/2']
        }
    ));

    describe('leading line with space', assertComments(
        `
            // Leading line comment with space

            getText('Foo');
        `,
        {
            otherLineLeading: ['Leading line comment with space']
        }
    ));

    describe('leading block and trailing block', assertComments(
        `
            /* Leading block comment */
            getText('Foo'); /* Trailing block comment */
        `,
        {
            otherLineLeading: ['Leading block comment'],
            sameLineTrailing: ['Trailing block comment']
        }
    ));

    describe('two leading block', assertComments(
        `
            /* Leading block comment 1/2 */
            /* Leading block comment 2/2 */
            getText('Foo');
        `,
        {
            otherLineLeading: ['Leading block comment 1/2', 'Leading block comment 2/2']
        }
    ));

    describe('leading block with space', assertComments(
        `
            /* Leading block comment with space */

            getText('Foo');
        `,
        {
            otherLineLeading: ['Leading block comment with space']
        }
    ));

    describe('leading block same line', assertComments(
        `
            /* Leading block comment on same line */ getText('Foo');
        `,
        {
            sameLineLeading: ['Leading block comment on same line']
        }
    ));

    describe('two leading block same line', assertComments(
        `
            /* Leading block comment on same line 1/2 */ /* Leading block comment on same line 2/2 */ getText('Foo');
        `,
        {
            sameLineLeading: ['Leading block comment on same line 1/2', 'Leading block comment on same line 2/2']
        }
    ));

    describe('two trailing block', assertComments(
        `
            getText('Foo'); /* Trailing block comment 1/2 */ /* Trailing block comment 2/2 */
        `,
        {
            sameLineTrailing: ['Trailing block comment 1/2', 'Trailing block comment 2/2']
        }
    ));

    describe('mixed', assertComments(
        `
            /* Marker: Leading block comment */
            // Leading line comment
            /* Leading block comment on same line */ getText('Foo'); /* Trailing block comment */ // Marker: Trailing line comment
        `,
        {
            otherLineLeading: ['Marker: Leading block comment', 'Leading line comment'],
            sameLineLeading: ['Leading block comment on same line'],
            sameLineTrailing: ['Trailing block comment', 'Marker: Trailing line comment']
        }
    ));

    describe('multi line', assertComments(
        `
            /* Leading multi
            line comment */
            getText('Foo'); /* Trailing multi
            line comment */
        `,
        {}
    ));

    describe('empty comment', assertComments(
        `
            /**/
            getText('Foo');
        `,
        {}
    ));

    describe('whitespace comment', assertComments(
        `
            /*  */
            getText('Foo');
        `,
        {}
    ));
});

describe('jsx', () => {

    describe('single line', assertComments(
        `
            <h1>{/* Leading block comment on same line */ getText('Foo') /* Trailing block comment */}</h1>
        `,
        {
            sameLineLeading: ['Leading block comment on same line'],
            sameLineTrailing: ['Trailing block comment']
        },
        {
            parseOptions: { scriptKind: ScriptKind.JSX }
        }
    ));

    describe('separate lines', assertComments(
        `
            <h1>{
                // Leading line comment
                getText('Foo') // Trailing line comment
            }</h1>
        `,
        {
            otherLineLeading: ['Leading line comment'],
            sameLineTrailing: ['Trailing line comment']
        },
        {
            parseOptions: { scriptKind: ScriptKind.JSX }
        }
    ));
});

describe('variable assignment', () => {

    describe('single variable', assertComments(
        `
            // Relevant leading line comment
            let foo = getText('Foo'); // Relevant trailing line comment
        `,
        {
            otherLineLeading: ['Relevant leading line comment'],
            sameLineTrailing: ['Relevant trailing line comment']
        }
    ));

    describe('multiple variables', () => {

        describe('single line', () => {

            describe('line comments', assertComments(
                `
                    // Irrelevant leading line comment
                    let bar = 42, foo = getText('Foo'); // Irrelevant trailing line comment
                `,
                {}
            ));

            describe('block comments', assertComments(
                `
                    let bar = 42 /* Irrelevant leading block comment */, foo = getText('Foo') /* Relevant trailing block comment */; /* Irrelevant trailing block comment */
                `,
                {
                    sameLineTrailing: ['Relevant trailing block comment']
                }
            ));
        });

        describe('separate lines', () => {

            describe('first line', assertComments(
                `
                    // Irrelevant leading line comment
                    let foo = getText('Foo'), // Relevant trailing line comment
                        bar = 42; // Irrelevant trailing line comment
                `,
                {
                    sameLineTrailing: ['Relevant trailing line comment']
                }
            ));

            describe('first line with extra whitespace', assertComments(
                `
                    // Irrelevant leading line comment
                    let foo = getText('Foo')    ,    // Relevant trailing line comment
                        bar = 42; // Irrelevant trailing line comment
                `,
                {
                    sameLineTrailing: ['Relevant trailing line comment']
                }
            ));

            describe('first line with directly relevant block comment', assertComments(
                `
                    // Irrelevant leading line comment
                    let foo = getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                        bar = 42; // Irrelevant trailing line comment
                `,
                {
                    sameLineTrailing: ['Relevant trailing block comment']
                }
            ));

            describe('second line', assertComments(
                `
                    // Irrelevant leading line comment
                    let bar = 42, // Irrelevant trailing line comment
                        // Irrelevant leading line comment
                        foo = getText('Foo'); // Relevant trailing line comment
                `,
                {
                    sameLineTrailing: ['Relevant trailing line comment']
                }
            ));

            describe('second line with extra whitespace', assertComments(
                `
                    // Irrelevant leading line comment
                    let bar = 42, // Irrelevant trailing line comment
                        // Irrelevant leading line comment
                        foo = getText('Foo')    ;    // Relevant trailing line comment
                `,
                {
                    sameLineTrailing: ['Relevant trailing line comment']
                }
            ));

            describe('second line with directly relevant block comment', assertComments(
                `
                    // Irrelevant leading line comment
                    let bar = 42, // Irrelevant trailing line comment
                        // Irrelevant leading line comment
                        foo = getText('Foo') /* Relevant trailing block comment */; // Irrelevant trailing line comment
                `,
                {
                    sameLineTrailing: ['Relevant trailing block comment']
                }
            ));
        });

        describe('without initializer', () => {

            describe('before', () => {

                describe('line comments', assertComments(
                    `
                        // Irrelevant leading line comment
                        let bar, foo = getText('Foo'); // Irrelevant trailing line comment
                    `,
                    {}
                ));

                describe('block comments', assertComments(
                    `
                        let bar /* Irrelevant leading block comment */, foo = getText('Foo') /* Relevant trailing block comment */; /* Irrelevant trailing block comment */
                    `,
                    {
                        sameLineTrailing: ['Relevant trailing block comment']
                    }
                ));
            });

            describe('after', () => {

                describe('line comments', assertComments(
                    `
                        // Irrelevant leading line comment
                        let foo = getText('Foo'), bar; // Irrelevant trailing line comment
                    `,
                    {}
                ));

                describe('block comments', assertComments(
                    `
                        let foo = getText('Foo') /* Relevant trailing block comment */, bar /* Irrelevant leading block comment */; /* Irrelevant trailing block comment */
                    `,
                    {
                        sameLineTrailing: ['Relevant trailing block comment']
                    }
                ));
            });
        });
    });
});

describe('object literal', () => {

    describe('single line', () => {

        describe('line comments', assertComments(
            `(
                // Irrelevant leading line comment
                { foo: getText('Foo') } // Irrelevant trailing line comment
            )`,
            {}
        ));

        describe('block comments', assertComments(
            `(
                { bar: 42 /* Irrelevant leading block comment */, foo: getText('Foo') /* Relevant trailing block comment */ } /* Irrelevant trailing block comment */
            )`,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));
    });

    describe('separate lines', () => {

        describe('first property', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    // Irrelevant leading line comment
                    foo: getText('Foo'), // Relevant trailing line comment
                    bar: 42 // Irrelevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first property - trailing comma', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    // Irrelevant leading line comment
                    foo: getText('Foo'), // Relevant trailing line comment
                    bar: 42, // Irrelevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first property with extra whitespace', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    // Irrelevant leading line comment
                    foo: getText('Foo')    ,    // Relevant trailing line comment
                    bar: 42 // Irrelevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first property with extra whitespace - trailing comma', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    // Irrelevant leading line comment
                    foo: getText('Foo')    ,    // Relevant trailing line comment
                    bar: 42, // Irrelevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first property with directly relevant block comment', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    // Irrelevant leading line comment
                    foo: getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                    bar: 42 // Irrelevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));

        describe('first property with directly relevant block comment - trailing comma', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    // Irrelevant leading line comment
                    foo: getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                    bar: 42, // Irrelevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));

        describe('second property', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar: 42, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo') // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second property - trailing comma', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar: 42, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo'), // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second property with extra whitespace', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar: 42, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo')    // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second property with extra whitespace - trailing comma', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar: 42, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo')    ,    // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second property with directly relevant block comment', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar: 42, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
            }
        ));

        describe('second property with directly relevant block comment - trailing comma', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar: 42, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo'), /* Relevant trailing block comment */ // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
            }
        ));

        describe('assignment shorthand', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo') // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('assignment shorthand - trailing comma', assertComments(
            `(
                // Irrelevant leading line comment
                {
                    bar, // Irrelevant trailing line comment
                    // Irrelevant leading line comment
                    foo: getText('Foo'), // Relevant trailing line comment
                } // Irrelevant trailing line comment
            )`,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));
    });
});

describe('array literal', () => {

    describe('single line', () => {

        describe('line comments', assertComments(
            `(
                // Irrelevant leading line comment
                [ getText('Foo') ] // Irrelevant trailing line comment
            )`,
            {}
        ));

        describe('block comments', assertComments(
            `(
                [ 'bar' /* Irrelevant leading block comment */, getText('Foo') /* Relevant trailing block comment */ ] /* Irrelevant trailing block comment */
            )`,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));
    });

    describe('separate lines', () => {

        describe('first element', assertComments(
            `(
                // Irrelevant leading line comment
                [
                    // Relevant leading line comment
                    getText('Foo'), // Relevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ] // Irrelevant trailing line comment
            )`,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first element with extra whitespace', assertComments(
            `(
                // Irrelevant leading line comment
                [
                    // Relevant leading line comment
                    getText('Foo')    ,    // Relevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ] // Irrelevant trailing line comment
            )`,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first element with directly relevant block comment', assertComments(
            `(
                // Irrelevant leading line comment
                [
                    // Relevant leading line comment
                    getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ] // Irrelevant trailing line comment
            )`,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));

        describe('second element', assertComments(
            `(
                // Irrelevant leading line comment
                [
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo') // Relevant trailing line comment
                ] // Irrelevant trailing line comment
            )`,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second element with extra whitespace', assertComments(
            `(
                // Irrelevant leading line comment
                [
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo')    // Relevant trailing line comment
                ] // Irrelevant trailing line comment
            )`,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second element with directly relevant block comment', assertComments(
            `(
                // Irrelevant leading line comment
                [
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                ] // Irrelevant trailing line comment
            )`,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
            }
        ));
    });
});

describe('call expression', () => {

    describe('single line', () => {

        describe('line comments', assertComments(
            `
                // Irrelevant leading line comment
                foo(getText('Foo')) // Irrelevant trailing line comment
            `,
            {}
        ));

        describe('block comments', assertComments(
            `
                foo('bar' /* Irrelevant leading block comment */, getText('Foo') /* Relevant trailing block comment */) /* Irrelevant trailing block comment */
            `,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));
    });

    describe('separate lines', () => {

        describe('first element', assertComments(
            `
                // Irrelevant leading line comment
                foo(
                    // Relevant leading line comment
                    getText('Foo'), // Relevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first element with extra whitespace', assertComments(
            `
                // Irrelevant leading line comment
                foo(
                    // Relevant leading line comment
                    getText('Foo')    ,    // Relevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first element with directly relevant block comment', assertComments(
            `
                // Irrelevant leading line comment
                foo(
                    // Relevant leading line comment
                    getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));

        describe('second element', assertComments(
            `
                // Irrelevant leading line comment
                foo(
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo') // Relevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second element with extra whitespace', assertComments(
            `
                // Irrelevant leading line comment
                foo(
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo')    // Relevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second element with directly relevant block comment', assertComments(
            `
                // Irrelevant leading line comment
                foo(
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
            }
        ));
    });
});

describe('new expression', () => {

    describe('single line', () => {

        describe('line comments', assertComments(
            `
                // Irrelevant leading line comment
                new Foo(getText('Foo')) // Irrelevant trailing line comment
            `,
            {}
        ));

        describe('block comments', assertComments(
            `
                new Foo('bar' /* Irrelevant leading block comment */, getText('Foo') /* Relevant trailing block comment */) /* Irrelevant trailing block comment */
            `,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));
    });

    describe('separate lines', () => {

        describe('first element', assertComments(
            `
                // Irrelevant leading line comment
                new Foo(
                    // Relevant leading line comment
                    getText('Foo'), // Relevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first element with extra whitespace', assertComments(
            `
                // Irrelevant leading line comment
                new Foo(
                    // Relevant leading line comment
                    getText('Foo')    ,    // Relevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first element with directly relevant block comment', assertComments(
            `
                // Irrelevant leading line comment
                new Foo(
                    // Relevant leading line comment
                    getText('Foo') /* Relevant trailing block comment */, // Irrelevant trailing line comment
                    'bar' // Irrelevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));

        describe('second element', assertComments(
            `
                // Irrelevant leading line comment
                new Foo(
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo') // Relevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second element with extra whitespace', assertComments(
            `
                // Irrelevant leading line comment
                new Foo(
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo')    // Relevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second element with directly relevant block comment', assertComments(
            `
                // Irrelevant leading line comment
                new Foo(
                    'bar', // Irrelevant trailing line comment
                    // Relevant leading line comment
                    getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                ) // Irrelevant trailing line comment
            `,
            {
                otherLineLeading: ['Relevant leading line comment'],
                sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
            }
        ));
    });
});

describe('return statement', () => {

    describe('single line', assertComments(
        `
            // Relevant leading line comment
            return getText('Foo'); // Relevant trailing line comment
        `,
        {
            otherLineLeading: ['Relevant leading line comment'],
            sameLineTrailing: ['Relevant trailing line comment']
        }
    ));
});

describe('throw statement', () => {

    describe('single line', assertComments(
        `
            // Relevant leading line comment
            throw getText('Foo'); // Relevant trailing line comment
        `,
        {
            otherLineLeading: ['Relevant leading line comment'],
            sameLineTrailing: ['Relevant trailing line comment']
        }
    ));
});

describe('parenthesized expression', () => {

    describe('single line', assertComments(
        `
            // Relevant leading line comment
            (getText('Foo')) // Relevant trailing line comment
        `,
        {
            otherLineLeading: ['Relevant leading line comment'],
            sameLineTrailing: ['Relevant trailing line comment']
        }
    ));
});

describe('ternary operator', () => {

    describe('single line', () => {

        describe('line comments', assertComments(
            `
                // Irrelevant leading line comment
                foo ? getText('Foo') : 'bar'; // Irrelevant trailing line comment
            `,
            {}
        ));

        describe('block comments', assertComments(
            `
                foo /* Irrelevant leading block comment */ ? getText('Foo') /* Relevant trailing block comment */ : 'bar'; /* Irrelevant trailing block comment */
            `,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));
    });

    describe('separate lines', () => {

        describe('first expression', assertComments(
            `
                // Irrelevant leading line comment
                foo
                    // Irrelevant leading line comment
                    ? getText('Foo') // Relevant trailing line comment
                    : 'bar'; // Irrelevant trailing line comment
            `,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first expression with extra whitespace', assertComments(
            `
                // Irrelevant leading line comment
                foo
                    // Irrelevant leading line comment
                    ? getText('Foo')    // Relevant trailing line comment
                    : 'bar'; // Irrelevant trailing line comment
            `,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('first expression with directly relevant block comment', assertComments(
            `
                // Irrelevant leading line comment
                foo
                    // Irrelevant leading line comment
                    ? getText('Foo') /* Relevant trailing block comment */ // Relevant trailing line comment
                    : 'bar'; // Irrelevant trailing line comment
            `,
            {
                sameLineTrailing: ['Relevant trailing block comment', 'Relevant trailing line comment']
            }
        ));

        describe('second expression', assertComments(
            `
                // Irrelevant leading line comment
                foo
                    // Irrelevant leading line comment
                    ? 'bar' // Irrelevant trailing line comment
                    : getText('Foo'); // Relevant trailing line comment
            `,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second expression with extra whitespace', assertComments(
            `
                // Irrelevant leading line comment
                foo
                    // Irrelevant leading line comment
                    ? 'bar' // Irrelevant trailing line comment
                    : getText('Foo')    ;    // Relevant trailing line comment
            `,
            {
                sameLineTrailing: ['Relevant trailing line comment']
            }
        ));

        describe('second expression with directly relevant block comment', assertComments(
            `
                // Irrelevant leading line comment
                foo
                    // Irrelevant leading line comment
                    ? 'bar' // Irrelevant trailing line comment
                    : getText('Foo') /* Relevant trailing block comment */; // Irrelevant trailing line comment
            `,
            {
                sameLineTrailing: ['Relevant trailing block comment']
            }
        ));
    });
});

describe('complex expressions', () => {

    describe('object literal call argument', assertComments(
        `
            foo({
                foo: getText('Foo'), // Relevant trailing line comment
                bar: 42
            });
        `,
        {
            sameLineTrailing: ['Relevant trailing line comment']
        }
    ));

    describe('array variable assignment', assertComments(
        `
            // Irrelevant leading line comment
            let foo = [
                'bar',
                getText('Foo') // Relevant trailing line comment
            ]; // Irrelevant trailing line comment
        `,
        {
            sameLineTrailing: ['Relevant trailing line comment']
        }
    ));

    describe('return ternary', assertComments(
        `
            // Irrelevant leading line comment
            return foo
                ? 'bar'
                : getText('Foo'); // Relevant trailing line comment
        `,
        {
            sameLineTrailing: ['Relevant trailing line comment']
        }
    ));
});

describe('regex', () => {

    describe('with capturing group', assertComments(
        `
            /* Marker: Leading block comment */
            // Leading line comment
            /* Leading block comment on same line */ getText('Foo'); /* Trailing block comment */ // Marker: Trailing line comment
        `,
        {
            otherLineLeading: ['Leading block comment'],
            sameLineTrailing: ['Trailing line comment']
        },
        {
            comments: { regex: /^Marker:\s*(.*)$/ }
        }
    ));

    describe('with capturing group empty string match', assertComments(
        `
            // Marker: Foo
            // Marker:
            // Marker: Bar
            getText('Foo');
        `,
        {
            otherLineLeading: ['Foo', '', 'Bar']
        },
        {
            comments: { regex: /^Marker:\s*(.*)$/ }
        }
    ));

    describe('without capturing group', assertComments(
        `
            /* Marker: Leading block comment */
            // Leading line comment
            /* Leading block comment on same line */ getText('Foo'); /* Trailing block comment */ // Marker: Trailing line comment
        `,
        {
            otherLineLeading: ['Marker: Leading block comment'],
            sameLineTrailing: ['Marker: Trailing line comment']
        },
        {
            comments: { regex: /^Marker:\s*.*$/ }
        }
    ));
});

function assertComments(
    source: string,
    expectedComments: { [P in keyof ICommentOptions]: string[] },
    options: { parseOptions?: IJsParseOptions, comments?: ICommentOptions } = {}
): () => void {

    function assertCommentsForOptions(commentOptions: ICommentOptions): () => void {
        return () => {
            let extractor = new GettextExtractor();

            extractor
                .createJsParser([
                    JsExtractors.callExpression('getText', {
                        arguments: {
                            text: 0
                        },
                        comments: {
                            ...commentOptions,
                            ...options.comments
                        }
                    })
                ])
                .parseString(source, undefined, options.parseOptions);

            let comments: string[] = [];

            if (commentOptions.otherLineLeading && expectedComments.otherLineLeading) {
                comments = comments.concat(expectedComments.otherLineLeading);
            }
            if (commentOptions.sameLineLeading && expectedComments.sameLineLeading) {
                comments = comments.concat(expectedComments.sameLineLeading);
            }
            if (commentOptions.sameLineTrailing && expectedComments.sameLineTrailing) {
                comments = comments.concat(expectedComments.sameLineTrailing);
            }

            expect(extractor.getMessages()).toStrictEqual([{
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: comments,
                references: []
            }]);
        };
    }

    return () => {
        test('all', assertCommentsForOptions({
            otherLineLeading: true,
            sameLineLeading: true,
            sameLineTrailing: true
        }));

        test('same line', assertCommentsForOptions({
            sameLineLeading: true,
            sameLineTrailing: true
        }));

        test('only trailing', assertCommentsForOptions({
            sameLineTrailing: true
        }));

        test('all leading', assertCommentsForOptions({
            otherLineLeading: true,
            sameLineLeading: true
        }));

        test('only same line leading', assertCommentsForOptions({
            sameLineLeading: true
        }));

        test('only other line leading', assertCommentsForOptions({
            otherLineLeading: true
        }));
    };
}
