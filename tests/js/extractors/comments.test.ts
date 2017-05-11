import { CatalogBuilder, IMessage } from '../../../src/builder';
import { JsParser } from '../../../src/js/parser';
import { callExpressionExtractor } from '../../../src/js/extractors/factories/callExpression';

describe('JS: comments', () => {

    const LEADING_LINE_AND_TRAILING_LINE = `
            // Leading line comment
            getText('Foo'); // Trailing line comment
        `;

    const TWO_LEADING_LINE = `
            // Leading line comment 1/2
            // Leading line comment 2/2
            getText('Foo');
        `;

    const LEADING_LINE_WITH_SPACE = `
            // Leading line comment with space

            getText('Foo');
        `;

    const LEADING_BLOCK_AND_TRAILING_BLOCK = `
            /* Leading block comment */
            getText('Foo'); /* Trailing block comment */
        `;

    const TWO_LEADING_BLOCK = `
            /* Leading block comment 1/2 */
            /* Leading block comment 2/2 */
            getText('Foo');
        `;

    const LEADING_BLOCK_WITH_SPACE = `
            /* Leading block comment with space */

            getText('Foo');
        `;

    const LEADING_BLOCK_SAME_LINE = `
            /* Leading block comment on same line */ getText('Foo');
        `;

    const TWO_LEADING_BLOCK_SAME_LINE = `
            /* Leading block comment on same line 1/2 */ /* Leading block comment on same line 2/2 */ getText('Foo');
        `;

    const TWO_TRAILING_BLOCK = `
            getText('Foo'); /* Trailing block comment 1/2 */ /* Trailing block comment 2/2 */
        `;

    const MIXED = `
            /* Marker: Leading block comment */
            // Leading line comment
            /* Leading block comment on same line */ getText('Foo'); /* Trailing block comment */ // Marker: Trailing line comment
        `;

    const MULTI_LINE = `
            /* Leading multi
            line comment */
            getText('Foo'); /* Trailing multi
            line comment */
        `;

    const JSX_BLOCK = `
            return <h1>{/* Leading block comment on same line */ getText('Foo') /* Trailing block comment */}</h1>;
        `;

    const JSX_LINE = `
            return <h1>{
                // Leading line comment
                getText('Foo') // Trailing line comment
            }</h1>;
        `;

    function getComments(source: string, fileName?: string): string[] {
        parser.parseString(source, fileName);
        return messages.pop().comments;
    }

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

    describe('all', () => {

        beforeEach(() => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        otherLineLeading: true,
                        sameLineLeading: true,
                        sameLineTrailing: true
                    }
                })
            ]);
        });

        test('leading line and trailing line', () => {
            expect(getComments(LEADING_LINE_AND_TRAILING_LINE)).toEqual([
                'Leading line comment',
                'Trailing line comment'
            ]);
        });

        test('two leading line', () => {
            expect(getComments(TWO_LEADING_LINE)).toEqual([
                'Leading line comment 1/2',
                'Leading line comment 2/2'
            ]);
        });

        test('leading line with space', () => {
            expect(getComments(LEADING_LINE_WITH_SPACE)).toEqual([
                'Leading line comment with space'
            ]);
        });

        test('leading block and trailing block', () => {
            expect(getComments(LEADING_BLOCK_AND_TRAILING_BLOCK)).toEqual([
                'Leading block comment',
                'Trailing block comment'
            ]);
        });
        test('two leading block', () => {
            expect(getComments(TWO_LEADING_BLOCK)).toEqual([
                'Leading block comment 1/2',
                'Leading block comment 2/2'
            ]);
        });
        test('leading block with space', () => {
            expect(getComments(LEADING_BLOCK_WITH_SPACE)).toEqual([
                'Leading block comment with space'
            ]);
        });

        test('leading block same line', () => {
            expect(getComments(LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line'
            ]);
        });
        test('two leading block same line', () => {
            expect(getComments(TWO_LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line 1/2',
                'Leading block comment on same line 2/2'
            ]);
        });

        test('two trailing block', () => {
            expect(getComments(TWO_TRAILING_BLOCK)).toEqual([
                'Trailing block comment 1/2',
                'Trailing block comment 2/2'
            ]);
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Marker: Leading block comment',
                'Leading line comment',
                'Leading block comment on same line',
                'Trailing block comment',
                'Marker: Trailing line comment'
            ]);
        });

        test('multi line', () => {
            expect(getComments(MULTI_LINE)).toBeUndefined();
        });

        test('jsx block', () => {
            expect(getComments(JSX_BLOCK, 'foo.jsx')).toEqual([
                'Leading block comment on same line',
                'Trailing block comment'
            ]);
        });

        test('jsx line', () => {
            expect(getComments(JSX_LINE, 'foo.jsx')).toEqual([
                'Leading line comment',
                'Trailing line comment'
            ]);
        });
    });

    describe('same line', () => {

        beforeEach(() => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        sameLineLeading: true,
                        sameLineTrailing: true
                    }
                })
            ]);
        });

        test('leading line and trailing line', () => {
            expect(getComments(LEADING_LINE_AND_TRAILING_LINE)).toEqual([
                'Trailing line comment'
            ]);
        });

        test('two leading line', () => {
            expect(getComments(TWO_LEADING_LINE)).toBeUndefined();
        });

        test('leading line with space', () => {
            expect(getComments(LEADING_LINE_WITH_SPACE)).toBeUndefined();
        });

        test('leading block and trailing block', () => {
            expect(getComments(LEADING_BLOCK_AND_TRAILING_BLOCK)).toEqual([
                'Trailing block comment'
            ]);
        });
        test('two leading block', () => {
            expect(getComments(TWO_LEADING_BLOCK)).toBeUndefined();
        });
        test('leading block with space', () => {
            expect(getComments(LEADING_BLOCK_WITH_SPACE)).toBeUndefined();
        });

        test('leading block same line', () => {
            expect(getComments(LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line'
            ]);
        });
        test('two leading block same line', () => {
            expect(getComments(TWO_LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line 1/2',
                'Leading block comment on same line 2/2'
            ]);
        });

        test('two trailing block', () => {
            expect(getComments(TWO_TRAILING_BLOCK)).toEqual([
                'Trailing block comment 1/2',
                'Trailing block comment 2/2'
            ]);
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Leading block comment on same line',
                'Trailing block comment',
                'Marker: Trailing line comment'
            ]);
        });

        test('multi line', () => {
            expect(getComments(MULTI_LINE)).toBeUndefined();
        });

        test('jsx block', () => {
            expect(getComments(JSX_BLOCK, 'foo.jsx')).toEqual([
                'Leading block comment on same line',
                'Trailing block comment'
            ]);
        });

        test('jsx line', () => {
            expect(getComments(JSX_LINE, 'foo.jsx')).toEqual([
                'Trailing line comment'
            ]);
        });
    });

    describe('only trailing', () => {

        beforeEach(() => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        sameLineTrailing: true
                    }
                })
            ]);
        });

        test('leading line and trailing line', () => {
            expect(getComments(LEADING_LINE_AND_TRAILING_LINE)).toEqual([
                'Trailing line comment'
            ]);
        });

        test('two leading line', () => {
            expect(getComments(TWO_LEADING_LINE)).toBeUndefined();
        });

        test('leading line with space', () => {
            expect(getComments(LEADING_LINE_WITH_SPACE)).toBeUndefined();
        });

        test('leading block and trailing block', () => {
            expect(getComments(LEADING_BLOCK_AND_TRAILING_BLOCK)).toEqual([
                'Trailing block comment'
            ]);
        });
        test('two leading block', () => {
            expect(getComments(TWO_LEADING_BLOCK)).toBeUndefined();
        });
        test('leading block with space', () => {
            expect(getComments(LEADING_BLOCK_WITH_SPACE)).toBeUndefined();
        });

        test('leading block same line', () => {
            expect(getComments(LEADING_BLOCK_SAME_LINE)).toBeUndefined();
        });
        test('two leading block same line', () => {
            expect(getComments(TWO_LEADING_BLOCK_SAME_LINE)).toBeUndefined();
        });

        test('two trailing block', () => {
            expect(getComments(TWO_TRAILING_BLOCK)).toEqual([
                'Trailing block comment 1/2',
                'Trailing block comment 2/2'
            ]);
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Trailing block comment',
                'Marker: Trailing line comment'
            ]);
        });

        test('multi line', () => {
            expect(getComments(MULTI_LINE)).toBeUndefined();
        });

        test('jsx block', () => {
            expect(getComments(JSX_BLOCK, 'foo.jsx')).toEqual([
                'Trailing block comment'
            ]);
        });

        test('jsx line', () => {
            expect(getComments(JSX_LINE, 'foo.jsx')).toEqual([
                'Trailing line comment'
            ]);
        });
    });

    describe('all leading', () => {

        beforeEach(() => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        sameLineLeading: true,
                        otherLineLeading: true
                    }
                })
            ]);
        });

        test('leading line and trailing line', () => {
            expect(getComments(LEADING_LINE_AND_TRAILING_LINE)).toEqual([
                'Leading line comment'
            ]);
        });

        test('two leading line', () => {
            expect(getComments(TWO_LEADING_LINE)).toEqual([
                'Leading line comment 1/2',
                'Leading line comment 2/2'
            ]);
        });

        test('leading line with space', () => {
            expect(getComments(LEADING_LINE_WITH_SPACE)).toEqual([
                'Leading line comment with space'
            ]);
        });

        test('leading block and trailing block', () => {
            expect(getComments(LEADING_BLOCK_AND_TRAILING_BLOCK)).toEqual([
                'Leading block comment'
            ]);
        });
        test('two leading block', () => {
            expect(getComments(TWO_LEADING_BLOCK)).toEqual([
                'Leading block comment 1/2',
                'Leading block comment 2/2'
            ]);
        });
        test('leading block with space', () => {
            expect(getComments(LEADING_BLOCK_WITH_SPACE)).toEqual([
                'Leading block comment with space'
            ]);
        });

        test('leading block same line', () => {
            expect(getComments(LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line'
            ]);
        });
        test('two leading block same line', () => {
            expect(getComments(TWO_LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line 1/2',
                'Leading block comment on same line 2/2'
            ]);
        });

        test('two trailing block', () => {
            expect(getComments(TWO_TRAILING_BLOCK)).toBeUndefined();
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Marker: Leading block comment',
                'Leading line comment',
                'Leading block comment on same line'
            ]);
        });

        test('multi line', () => {
            expect(getComments(MULTI_LINE)).toBeUndefined();
        });

        test('jsx block', () => {
            expect(getComments(JSX_BLOCK, 'foo.jsx')).toEqual([
                'Leading block comment on same line'
            ]);
        });

        test('jsx line', () => {
            expect(getComments(JSX_LINE, 'foo.jsx')).toEqual([
                'Leading line comment'
            ]);
        });
    });

    describe('only same line leading', () => {

        beforeEach(() => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        sameLineLeading: true
                    }
                })
            ]);
        });

        test('leading line and trailing line', () => {
            expect(getComments(LEADING_LINE_AND_TRAILING_LINE)).toBeUndefined();
        });

        test('two leading line', () => {
            expect(getComments(TWO_LEADING_LINE)).toBeUndefined();
        });

        test('leading line with space', () => {
            expect(getComments(LEADING_LINE_WITH_SPACE)).toBeUndefined();
        });

        test('leading block and trailing block', () => {
            expect(getComments(LEADING_BLOCK_AND_TRAILING_BLOCK)).toBeUndefined();
        });
        test('two leading block', () => {
            expect(getComments(TWO_LEADING_BLOCK)).toBeUndefined();
        });
        test('leading block with space', () => {
            expect(getComments(LEADING_BLOCK_WITH_SPACE)).toBeUndefined();
        });

        test('leading block same line', () => {
            expect(getComments(LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line'
            ]);
        });
        test('two leading block same line', () => {
            expect(getComments(TWO_LEADING_BLOCK_SAME_LINE)).toEqual([
                'Leading block comment on same line 1/2',
                'Leading block comment on same line 2/2'
            ]);
        });

        test('two trailing block', () => {
            expect(getComments(TWO_TRAILING_BLOCK)).toBeUndefined();
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Leading block comment on same line'
            ]);
        });

        test('multi line', () => {
            expect(getComments(MULTI_LINE)).toBeUndefined();
        });

        test('jsx block', () => {
            expect(getComments(JSX_BLOCK, 'foo.jsx')).toEqual([
                'Leading block comment on same line'
            ]);
        });

        test('jsx line', () => {
            expect(getComments(JSX_LINE, 'foo.jsx')).toBeUndefined();
        });
    });

    describe('only other line leading', () => {

        beforeEach(() => {
            parser = new JsParser(builder, [
                callExpressionExtractor('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    comments: {
                        otherLineLeading: true
                    }
                })
            ]);
        });

        test('leading line and trailing line', () => {
            expect(getComments(LEADING_LINE_AND_TRAILING_LINE)).toEqual([
                'Leading line comment'
            ]);
        });

        test('two leading line', () => {
            expect(getComments(TWO_LEADING_LINE)).toEqual([
                'Leading line comment 1/2',
                'Leading line comment 2/2'
            ]);
        });

        test('leading line with space', () => {
            expect(getComments(LEADING_LINE_WITH_SPACE)).toEqual([
                'Leading line comment with space'
            ]);
        });

        test('leading block and trailing block', () => {
            expect(getComments(LEADING_BLOCK_AND_TRAILING_BLOCK)).toEqual([
                'Leading block comment'
            ]);
        });
        test('two leading block', () => {
            expect(getComments(TWO_LEADING_BLOCK)).toEqual([
                'Leading block comment 1/2',
                'Leading block comment 2/2'
            ]);
        });
        test('leading block with space', () => {
            expect(getComments(LEADING_BLOCK_WITH_SPACE)).toEqual([
                'Leading block comment with space'
            ]);
        });

        test('leading block same line', () => {
            expect(getComments(LEADING_BLOCK_SAME_LINE)).toBeUndefined();
        });
        test('two leading block same line', () => {
            expect(getComments(TWO_LEADING_BLOCK_SAME_LINE)).toBeUndefined();
        });

        test('two trailing block', () => {
            expect(getComments(TWO_TRAILING_BLOCK)).toBeUndefined();
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Marker: Leading block comment',
                'Leading line comment'
            ]);
        });

        test('multi line', () => {
            expect(getComments(MULTI_LINE)).toBeUndefined();
        });

        test('jsx block', () => {
            expect(getComments(JSX_BLOCK, 'foo.jsx')).toBeUndefined();
        });

        test('jsx line', () => {
            expect(getComments(JSX_LINE, 'foo.jsx')).toEqual([
                'Leading line comment'
            ]);
        });
    });

    describe('regex', () => {

        beforeEach(() => {
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
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Leading block comment',
                'Trailing line comment'
            ]);
        });
    });

    describe('regex without capturing group', () => {

        beforeEach(() => {
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
        });

        test('mixed', () => {
            expect(getComments(MIXED)).toEqual([
                'Marker: Leading block comment',
                'Marker: Trailing line comment'
            ]);
        });
    });
});
