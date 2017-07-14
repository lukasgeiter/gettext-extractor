import { IGettextExtractorStats } from '../src/extractor';
import { CatalogBuilder } from '../src/builder';

describe('CatalogBuilder', () => {

    let builder: CatalogBuilder,
        stats: IGettextExtractorStats;

    beforeEach(() => {
        stats = {
            numberOfMessages: 0,
            numberOfPluralMessages: 0,
            numberOfMessageUsages: 0,
            numberOfContexts: 0,
            numberOfParsedFiles: 0,
            numberOfParsedFilesWithMessages: 0
        };

        builder = new CatalogBuilder(stats);
    });

    test('singular messages', () => {
        builder.addMessage({
            text: 'Foo'
        });
        builder.addMessage({
            text: 'Bar'
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Bar',
                textPlural: null,
                context: null,
                comments: [],
                references: []
            },
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: [],
                references: []
            }
        ]);
    });

    test('singular and plural messages', () => {
        builder.addMessage({
            text: 'Foo'
        });
        builder.addMessage({
            text: 'Bar',
            textPlural: 'Bars'
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Bar',
                textPlural: 'Bars',
                context: null,
                comments: [],
                references: []
            },
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: [],
                references: []
            }
        ]);
    });

    test('colliding basic singular and plural messages', () => {
        builder.addMessage({
            text: 'Foo',
            textPlural: 'Foos'
        });
        builder.addMessage({
            text: 'Foo'
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Foo',
                textPlural: 'Foos',
                context: null,
                comments: [],
                references: []
            }
        ]);
    });

    test('contexts', () => {
        builder.addMessage({
            text: 'Foo'
        });
        builder.addMessage({
            text: 'Foo',
            context: 'Context1'
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: [],
                references: []
            },
            {
                text: 'Foo',
                textPlural: null,
                context: 'Context1',
                comments: [],
                references: []
            }
        ]);
    });

    test('references', () => {
        builder.addMessage({
            text: 'Foo',
            references: ['foo.ts:4']
        });
        builder.addMessage({
            text: 'Bar',
            references: ['bar.ts:13']
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Bar',
                textPlural: null,
                context: null,
                comments: [],
                references: ['bar.ts:13']
            },
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: [],
                references: ['foo.ts:4']
            }
        ]);
    });

    test('multiple references', () => {
        builder.addMessage({
            text: 'Foo',
            references: ['foo.ts:4', 'foo.ts:7']
        });
        builder.addMessage({
            text: 'Bar',
            references: ['bar.ts:13']
        });
        builder.addMessage({
            text: 'Bar',
            references: ['bar.ts:28']
        });
        builder.addMessage({
            text: 'Baz'
        });
        builder.addMessage({
            text: 'Baz',
            references: ['baz.ts:12']
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Bar',
                textPlural: null,
                context: null,
                comments: [],
                references: ['bar.ts:13', 'bar.ts:28']
            },
            {
                text: 'Baz',
                textPlural: null,
                context: null,
                comments: [],
                references: ['baz.ts:12']
            },
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: [],
                references: ['foo.ts:4', 'foo.ts:7']
            }
        ]);
    });

    test('comments', () => {
        builder.addMessage({
            text: 'Foo',
            comments: ['Comment about Foo']
        });
        builder.addMessage({
            text: 'Bar',
            comments: ['Comment about Bar']
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Bar',
                textPlural: null,
                context: null,
                comments: ['Comment about Bar'],
                references: []
            },
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: ['Comment about Foo'],
                references: []
            }
        ]);
    });

    test('multiple comments', () => {
        builder.addMessage({
            text: 'Foo',
            comments: ['Comment1 about Foo', 'Comment2 about Foo']
        });
        builder.addMessage({
            text: 'Bar',
            comments: ['Comment1 about Bar']
        });
        builder.addMessage({
            text: 'Bar',
            comments: ['Comment2 about Bar']
        });
        builder.addMessage({
            text: 'Baz'
        });
        builder.addMessage({
            text: 'Baz',
            comments: ['Comment about Baz']
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Bar',
                textPlural: null,
                context: null,
                comments: ['Comment1 about Bar', 'Comment2 about Bar'],
                references: []
            },
            {
                text: 'Baz',
                textPlural: null,
                context: null,
                comments: ['Comment about Baz'],
                references: []
            },
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: ['Comment1 about Foo', 'Comment2 about Foo'],
                references: []
            }
        ]);
    });

    test('combination of different tests', () => {
        builder.addMessage({
            text: 'Foo',
            comments: ['Comment1 about Foo'],
            references: ['foo.ts:12']
        });

        builder.addMessage({
            text: 'Foo',
            references: ['foo.ts:16']
        });

        builder.addMessage({
            text: 'Foo',
            textPlural: 'Foos',
            comments: ['Comment2 about Foo'],
            references: ['foo.ts:30']
        });

        builder.addMessage({
            text: 'Foo',
            textPlural: 'Foos',
            context: 'Context1'
        });

        builder.addMessage({
            text: 'Foo',
            context: 'Context1',
            references: ['foo.ts:16']
        });

        builder.addMessage({
            text: 'Bar',
            context: 'Context1'
        });

        builder.addMessage({
            text: 'Bar',
            context: 'Context2',
            comments: ['Comment1 about Bar', 'Comment2 about Bar']
        });

        builder.addMessage({
            text: 'Bar',
            context: 'Context2',
            references: ['bar.ts:3']
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Foo',
                textPlural: 'Foos',
                context: null,
                comments: ['Comment1 about Foo', 'Comment2 about Foo'],
                references: ['foo.ts:12', 'foo.ts:16', 'foo.ts:30']
            },
            {
                text: 'Bar',
                textPlural: null,
                context: 'Context1',
                comments: [],
                references: []
            },
            {
                text: 'Foo',
                textPlural: 'Foos',
                context: 'Context1',
                comments: [],
                references: ['foo.ts:16']
            },
            {
                text: 'Bar',
                textPlural: null,
                context: 'Context2',
                comments: ['Comment1 about Bar', 'Comment2 about Bar'],
                references: ['bar.ts:3']
            }
        ]);
    });

    test('alphabetical order of messages', () => {
        builder.addMessage({
            text: 'B',
            context: 'B'
        });
        builder.addMessage({
            text: 'A',
            context: 'B'
        });
        builder.addMessage({
            text: 'B',
            context: 'A'
        });
        builder.addMessage({
            text: 'A',
            context: 'A'
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'A',
                textPlural: null,
                context: 'A',
                comments: [],
                references: []
            },
            {
                text: 'B',
                textPlural: null,
                context: 'A',
                comments: [],
                references: []
            },
            {
                text: 'A',
                textPlural: null,
                context: 'B',
                comments: [],
                references: []
            },
            {
                text: 'B',
                textPlural: null,
                context: 'B',
                comments: [],
                references: []
            }
        ]);
    });

    test('incompatible plurals', () => {
        builder.addMessage({
            text: 'Foo',
            textPlural: 'Foos'
        });

        expect(() => {
            builder.addMessage({
                text: 'Foo',
                textPlural: 'Bars'
            });
        }).toThrowError(`Incompatible plurals found for 'Foo' ('Foos' and 'Bars')`);
    });

    test('duplicate references', () => {
        builder.addMessage({
            text: 'Foo',
            references: ['foo.ts:42']
        });

        builder.addMessage({
            text: 'Foo',
            references: ['foo.ts:42']
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: [],
                references: ['foo.ts:42']
            }
        ]);
    });

    test('duplicate comments', () => {
        builder.addMessage({
            text: 'Foo',
            comments: ['Comment about Foo']
        });

        builder.addMessage({
            text: 'Foo',
            comments: ['Comment about Foo']
        });

        expect(builder.getMessages()).toEqual([
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: ['Comment about Foo'],
                references: []
            }
        ]);
    });

    describe('getContexts', () => {

        test('only default context', () => {
            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Bar'
            });

            expect(builder.getContexts()).toEqual([
                {
                    name: '',
                    messages: [
                        {
                            text: 'Bar',
                            textPlural: null,
                            context: null,
                            comments: [],
                            references: []
                        },
                        {
                            text: 'Foo',
                            textPlural: null,
                            context: null,
                            comments: [],
                            references: []
                        }
                    ]
                }
            ]);
        });

        test('multiple contexts', () => {
            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Bar',
                context: 'Context1'
            });

            builder.addMessage({
                text: 'Baz',
                context: 'Context2'
            });

            expect(builder.getContexts()).toEqual([
                {
                    name: '',
                    messages: [
                        {
                            text: 'Foo',
                            textPlural: null,
                            context: null,
                            comments: [],
                            references: []
                        }
                    ]
                },
                {
                    name: 'Context1',
                    messages: [
                        {
                            text: 'Bar',
                            textPlural: null,
                            context: 'Context1',
                            comments: [],
                            references: []
                        }
                    ]
                },
                {
                    name: 'Context2',
                    messages: [
                        {
                            text: 'Baz',
                            textPlural: null,
                            context: 'Context2',
                            comments: [],
                            references: []
                        }
                    ]
                }
            ]);
        });

        test('no default context', () => {
            builder.addMessage({
                text: 'Foo',
                context: 'Context1'
            });

            builder.addMessage({
                text: 'Bar',
                context: 'Context2'
            });

            builder.addMessage({
                text: 'Baz',
                context: 'Context2'
            });

            expect(builder.getContexts()).toEqual([
                {
                    name: 'Context1',
                    messages: [
                        {
                            text: 'Foo',
                            textPlural: null,
                            context: 'Context1',
                            comments: [],
                            references: []
                        }
                    ]
                },
                {
                    name: 'Context2',
                    messages: [
                        {
                            text: 'Bar',
                            textPlural: null,
                            context: 'Context2',
                            comments: [],
                            references: []
                        },
                        {
                            text: 'Baz',
                            textPlural: null,
                            context: 'Context2',
                            comments: [],
                            references: []
                        }
                    ]
                }
            ]);
        });
    });

    describe('getMessagesByContext', () => {

        test('only default context', () => {
            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Bar'
            });

            expect(builder.getMessagesByContext('')).toEqual([
                {
                    text: 'Bar',
                    textPlural: null,
                    context: null,
                    comments: [],
                    references: []
                },
                {
                    text: 'Foo',
                    textPlural: null,
                    context: null,
                    comments: [],
                    references: []
                }
            ]);
        });

        test('multiple contexts', () => {
            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Bar',
                context: 'Context1'
            });

            builder.addMessage({
                text: 'Baz',
                context: 'Context2'
            });

            expect(builder.getMessagesByContext('')).toEqual([
                {
                    text: 'Foo',
                    textPlural: null,
                    context: null,
                    comments: [],
                    references: []
                }
            ]);

            expect(builder.getMessagesByContext('Context1')).toEqual([
                {
                    text: 'Bar',
                    textPlural: null,
                    context: 'Context1',
                    comments: [],
                    references: []
                }
            ]);

            expect(builder.getMessagesByContext('Context2')).toEqual([
                {
                    text: 'Baz',
                    textPlural: null,
                    context: 'Context2',
                    comments: [],
                    references: []
                }
            ]);
        });

        test('no default context', () => {
            builder.addMessage({
                text: 'Foo',
                context: 'Context1'
            });

            builder.addMessage({
                text: 'Bar',
                context: 'Context2'
            });

            builder.addMessage({
                text: 'Baz',
                context: 'Context2'
            });

            expect(builder.getMessagesByContext('Context1')).toEqual([
                {
                    text: 'Foo',
                    textPlural: null,
                    context: 'Context1',
                    comments: [],
                    references: []
                }
            ]);

            expect(builder.getMessagesByContext('Context2')).toEqual([
                {
                    text: 'Bar',
                    textPlural: null,
                    context: 'Context2',
                    comments: [],
                    references: []
                },
                {
                    text: 'Baz',
                    textPlural: null,
                    context: 'Context2',
                    comments: [],
                    references: []
                }
            ]);
        });

        test('inexistent context', () => {
            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Bar'
            });

            expect(builder.getMessagesByContext('Context')).toEqual([]);
        });
    });

    describe('stats', () => {

        test('basic scenario', () => {
            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Bar'
            });

            expect(stats.numberOfMessageUsages).toBe(4);
            expect(stats.numberOfMessages).toBe(2);
            expect(stats.numberOfPluralMessages).toBe(0);
            expect(stats.numberOfContexts).toBe(1);
        });

        test('plurals', () => {
            builder.addMessage({
                text: 'Foo',
                textPlural: 'Foos'
            });

            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Bar'
            });

            builder.addMessage({
                text: 'Bar',
                textPlural: 'Bars'
            });

            builder.addMessage({
                text: 'Baz',
                textPlural: 'Bazz'
            });

            builder.addMessage({
                text: 'Baz',
                textPlural: 'Bazz'
            });

            expect(stats.numberOfMessageUsages).toBe(6);
            expect(stats.numberOfMessages).toBe(3);
            expect(stats.numberOfPluralMessages).toBe(3);
            expect(stats.numberOfContexts).toBe(1);
        });

        test('contexts', () => {
            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Foo'
            });

            builder.addMessage({
                text: 'Foo',
                context: 'Context 1'
            });

            builder.addMessage({
                text: 'Foo',
                context: 'Context 1'
            });

            builder.addMessage({
                text: 'Foo',
                context: 'Context 2'
            });

            expect(stats.numberOfMessageUsages).toBe(5);
            expect(stats.numberOfMessages).toBe(3);
            expect(stats.numberOfPluralMessages).toBe(0);
            expect(stats.numberOfContexts).toBe(3);
        });
    });
});
