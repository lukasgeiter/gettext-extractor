import { IAddMessageCallback, Parser } from '../src/parser';
import { IMessage } from '../src/builder';

export const foo = 'bar';

describe('Abstract Parser', () => {

    describe('createAddMessageCallback', () => {

        let lineNumber: number,
            messages: IMessage[],
            callback: IAddMessageCallback;

        beforeEach(() => {
            messages = [];
            callback = Parser.createAddMessageCallback(messages, 'foo.ts', () => lineNumber);
        });

        test('single call', () => {
            lineNumber = 16;

            callback({
                text: 'Foo'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:16']
                }
            ]);
        });

        test('multiple calls', () => {
            lineNumber = 16;

            callback({
                text: 'Foo'
            });

            lineNumber = 17;

            callback({
                text: 'Bar'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:16']
                },
                {
                    text: 'Bar',
                    references: ['foo.ts:17']
                }
            ]);
        });

        test('plural', () => {
            lineNumber = 16;

            callback({
                text: 'Foo',
                textPlural: 'Foos'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos',
                    references: ['foo.ts:16']
                }
            ]);
        });

        test('context', () => {
            lineNumber = 16;

            callback({
                text: 'Foo',
                context: 'Context'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    context: 'Context',
                    references: ['foo.ts:16']
                }
            ]);
        });

        test('custom line number', () => {
            lineNumber = 16;

            callback({
                text: 'Foo',
                lineNumber: 100
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:100']
                }
            ]);
        });

        test('custom file name', () => {
            lineNumber = 16;

            callback({
                text: 'Foo',
                fileName: 'bar.ts'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['bar.ts:16']
                }
            ]);
        });

        test('custom file name and line number', () => {
            lineNumber = 16;

            callback({
                text: 'Foo',
                fileName: 'bar.ts',
                lineNumber: 100
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['bar.ts:100']
                }
            ]);
        });

        test('string literal file name', () => {
            lineNumber = 16;
            callback = Parser.createAddMessageCallback(messages, Parser.STRING_LITERAL_FILENAME, () => lineNumber);

            callback({
                text: 'Foo'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('comments', () => {
            lineNumber = 16;

            callback({
                text: 'Foo',
                comments: ['Comment 1', 'Comment 2']
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:16'],
                    comments: ['Comment 1', 'Comment 2']
                }
            ]);
        });
    });
});
