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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo'
                },
                'Bar': {
                    msgid: 'Bar'
                }
            }
        });
    });

    test('singular and plural messages', () => {
        builder.addMessage({
            text: 'Foo'
        });
        builder.addMessage({
            text: 'Bar',
            textPlural: 'Bars'
        });

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo'
                },
                'Bar': {
                    msgid: 'Bar',
                    msgid_plural: 'Bars'
                }
            }
        });
    });

    test('colliding basic singular and plural messages', () => {
        builder.addMessage({
            text: 'Foo',
            textPlural: 'Foos'
        });
        builder.addMessage({
            text: 'Foo'
        });

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    msgid_plural: 'Foos'
                }
            }
        });
    });

    test('contexts', () => {
        builder.addMessage({
            text: 'Foo'
        });
        builder.addMessage({
            text: 'Foo',
            context: 'Context1'
        });

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo'
                }
            },
            'Context1': {
                'Foo': {
                    msgid: 'Foo',
                    msgctxt: 'Context1'
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    comments: {
                        reference: 'foo.ts:4'
                    }
                },
                'Bar': {
                    msgid: 'Bar',
                    comments: {
                        reference: 'bar.ts:13'
                    }
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    comments: {
                        reference: 'foo.ts:4\nfoo.ts:7'
                    }
                },
                'Bar': {
                    msgid: 'Bar',
                    comments: {
                        reference: 'bar.ts:13\nbar.ts:28'
                    }
                },
                'Baz': {
                    msgid: 'Baz',
                    comments: {
                        reference: 'baz.ts:12'
                    }
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    comments: {
                        extracted: 'Comment about Foo'
                    }
                },
                'Bar': {
                    msgid: 'Bar',
                    comments: {
                        extracted: 'Comment about Bar'
                    }
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    comments: {
                        extracted: 'Comment1 about Foo\nComment2 about Foo'
                    }
                },
                'Bar': {
                    msgid: 'Bar',
                    comments: {
                        extracted: 'Comment1 about Bar\nComment2 about Bar'
                    }
                },
                'Baz': {
                    msgid: 'Baz',
                    comments: {
                        extracted: 'Comment about Baz'
                    }
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    msgid_plural: 'Foos',
                    comments: {
                        reference: 'foo.ts:12\nfoo.ts:16\nfoo.ts:30',
                        extracted: 'Comment1 about Foo\nComment2 about Foo'
                    }
                }
            },
            'Context1': {
                'Foo': {
                    msgid: 'Foo',
                    msgid_plural: 'Foos',
                    msgctxt: 'Context1',
                    comments: {
                        reference: 'foo.ts:16'
                    }
                },
                'Bar': {
                    msgid: 'Bar',
                    msgctxt: 'Context1'
                }
            },
            'Context2': {
                'Bar': {
                    msgid: 'Bar',
                    msgctxt: 'Context2',
                    comments: {
                        reference: 'bar.ts:3',
                        extracted: 'Comment1 about Bar\nComment2 about Bar'
                    }
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            'A': {
                'A': {
                    msgid: 'A',
                    msgctxt: 'A'
                },
                'B': {
                    msgid: 'B',
                    msgctxt: 'A'
                }
            },
            'B': {
                'A': {
                    msgid: 'A',
                    msgctxt: 'B'
                },
                'B': {
                    msgid: 'B',
                    msgctxt: 'B'
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    comments: {
                        reference: 'foo.ts:42'
                    }
                }
            }
        });
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

        expect(builder.toGettextMessages()).toEqual({
            '': {
                'Foo': {
                    msgid: 'Foo',
                    comments: {
                        extracted: 'Comment about Foo'
                    }
                }
            }
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
            expect( stats.numberOfMessages).toBe(2);
            expect( stats.numberOfPluralMessages).toBe(0);
            expect( stats.numberOfContexts).toBe(1);
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
