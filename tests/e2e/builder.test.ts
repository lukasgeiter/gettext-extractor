import { GettextExtractor } from '../../dist';

let extractor: GettextExtractor;

beforeEach(() => {
    extractor = new GettextExtractor();
});

test('singular messages', () => {
    extractor.addMessage({
        text: 'Foo',
        references: [],
        comments: []
    });
    extractor.addMessage({
        text: 'Bar',
        references: [],
        comments: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        comments: [],
        references: []
    });
    extractor.addMessage({
        text: 'Bar',
        textPlural: 'Bars',
        comments: [],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        textPlural: 'Foos',
        comments: [],
        references: []
    });
    extractor.addMessage({
        text: 'Foo',
        comments: [],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        comments: [],
        references: []
    });
    extractor.addMessage({
        text: 'Foo',
        context: 'Context1',
        comments: [],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        references: ['foo.ts:4'],
        comments: []
    });
    extractor.addMessage({
        text: 'Bar',
        references: ['bar.ts:13'],
        comments: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        references: ['foo.ts:4', 'foo.ts:7'],
        comments: []
    });
    extractor.addMessage({
        text: 'Bar',
        references: ['bar.ts:13'],
        comments: []
    });
    extractor.addMessage({
        text: 'Bar',
        references: ['bar.ts:28'],
        comments: []
    });
    extractor.addMessage({
        text: 'Baz',
        references: [],
        comments: []
    });
    extractor.addMessage({
        text: 'Baz',
        references: ['baz.ts:12'],
        comments: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        comments: ['Comment about Foo'],
        references: []
    });
    extractor.addMessage({
        text: 'Bar',
        comments: ['Comment about Bar'],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        comments: ['Comment1 about Foo', 'Comment2 about Foo'],
        references: []
    });
    extractor.addMessage({
        text: 'Bar',
        comments: ['Comment1 about Bar'],
        references: []
    });
    extractor.addMessage({
        text: 'Bar',
        comments: ['Comment2 about Bar'],
        references: []
    });
    extractor.addMessage({
        text: 'Baz',
        comments: [],
        references: []
    });
    extractor.addMessage({
        text: 'Baz',
        comments: ['Comment about Baz'],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        comments: ['Comment1 about Foo'],
        references: ['foo.ts:12']
    });

    extractor.addMessage({
        text: 'Foo',
        comments: [],
        references: ['foo.ts:16']
    });

    extractor.addMessage({
        text: 'Foo',
        textPlural: 'Foos',
        comments: ['Comment2 about Foo'],
        references: ['foo.ts:30']
    });

    extractor.addMessage({
        text: 'Foo',
        textPlural: 'Foos',
        context: 'Context1',
        comments: [],
        references: []
    });

    extractor.addMessage({
        text: 'Foo',
        context: 'Context1',
        references: ['foo.ts:16'],
        comments: []
    });

    extractor.addMessage({
        text: 'Bar',
        context: 'Context1',
        comments: [],
        references: []
    });

    extractor.addMessage({
        text: 'Bar',
        context: 'Context2',
        comments: ['Comment1 about Bar', 'Comment2 about Bar'],
        references: []
    });

    extractor.addMessage({
        text: 'Bar',
        context: 'Context2',
        references: ['bar.ts:3'],
        comments: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'B',
        context: 'B',
        comments: [],
        references: []
    });
    extractor.addMessage({
        text: 'A',
        context: 'B',
        comments: [],
        references: []
    });
    extractor.addMessage({
        text: 'B',
        context: 'A',
        comments: [],
        references: []
    });
    extractor.addMessage({
        text: 'A',
        context: 'A',
        comments: [],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        textPlural: 'Foos',
        comments: [],
        references: []
    });

    expect(() => {
        extractor.addMessage({
            text: 'Foo',
            textPlural: 'Bars',
            comments: [],
            references: []
        });
    }).toThrowError(`Incompatible plurals found for 'Foo' ('Foos' and 'Bars')`);
});

test('duplicate references', () => {
    extractor.addMessage({
        text: 'Foo',
        references: ['foo.ts:42'],
        comments: []
    });

    extractor.addMessage({
        text: 'Foo',
        references: ['foo.ts:42'],
        comments: []
    });

    expect(extractor.getMessages()).toEqual([
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
    extractor.addMessage({
        text: 'Foo',
        comments: ['Comment about Foo'],
        references: []
    });

    extractor.addMessage({
        text: 'Foo',
        comments: ['Comment about Foo'],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
        {
            text: 'Foo',
            textPlural: null,
            context: null,
            comments: ['Comment about Foo'],
            references: []
        }
    ]);
});

test('empty text', () => {
    extractor.addMessage({
        text: '',
        comments: [],
        references: []
    });

    extractor.addMessage({
        text: 'Foo',
        textPlural: '',
        comments: [],
        references: []
    });

    expect(extractor.getMessages()).toEqual([
        {
            text: '',
            textPlural: null,
            context: null,
            comments: [],
            references: []
        },
        {
            text: 'Foo',
            textPlural: '',
            context: null,
            comments: [],
            references: []
        }
    ]);
});

describe('getContexts', () => {

    test('only default context', () => {
        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            comments: [],
            references: []
        });

        expect(extractor.getContexts()).toEqual([
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
        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            context: 'Context1',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Baz',
            context: 'Context2',
            comments: [],
            references: []
        });

        expect(extractor.getContexts()).toEqual([
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
        extractor.addMessage({
            text: 'Foo',
            context: 'Context1',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            context: 'Context2',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Baz',
            context: 'Context2',
            comments: [],
            references: []
        });

        expect(extractor.getContexts()).toEqual([
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
        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            comments: [],
            references: []
        });

        expect(extractor.getMessagesByContext('')).toEqual([
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
        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            context: 'Context1',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Baz',
            context: 'Context2',
            comments: [],
            references: []
        });

        expect(extractor.getMessagesByContext('')).toEqual([
            {
                text: 'Foo',
                textPlural: null,
                context: null,
                comments: [],
                references: []
            }
        ]);

        expect(extractor.getMessagesByContext('Context1')).toEqual([
            {
                text: 'Bar',
                textPlural: null,
                context: 'Context1',
                comments: [],
                references: []
            }
        ]);

        expect(extractor.getMessagesByContext('Context2')).toEqual([
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
        extractor.addMessage({
            text: 'Foo',
            context: 'Context1',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            context: 'Context2',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Baz',
            context: 'Context2',
            comments: [],
            references: []
        });

        expect(extractor.getMessagesByContext('Context1')).toEqual([
            {
                text: 'Foo',
                textPlural: null,
                context: 'Context1',
                comments: [],
                references: []
            }
        ]);

        expect(extractor.getMessagesByContext('Context2')).toEqual([
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
        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            comments: [],
            references: []
        });

        expect(extractor.getMessagesByContext('Context')).toEqual([]);
    });
});

describe('stats', () => {

    test('basic scenario', () => {
        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            comments: [],
            references: []
        });

        expect(extractor.getStats().numberOfMessageUsages).toBe(4);
        expect(extractor.getStats().numberOfMessages).toBe(2);
        expect(extractor.getStats().numberOfPluralMessages).toBe(0);
        expect(extractor.getStats().numberOfContexts).toBe(1);
    });

    test('plurals', () => {
        extractor.addMessage({
            text: 'Foo',
            textPlural: 'Foos',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Bar',
            textPlural: 'Bars',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Baz',
            textPlural: 'Bazz',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Baz',
            textPlural: 'Bazz',
            comments: [],
            references: []
        });

        expect(extractor.getStats().numberOfMessageUsages).toBe(6);
        expect(extractor.getStats().numberOfMessages).toBe(3);
        expect(extractor.getStats().numberOfPluralMessages).toBe(3);
        expect(extractor.getStats().numberOfContexts).toBe(1);
    });

    test('contexts', () => {
        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Foo',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Foo',
            context: 'Context 1',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Foo',
            context: 'Context 1',
            comments: [],
            references: []
        });

        extractor.addMessage({
            text: 'Foo',
            context: 'Context 2',
            comments: [],
            references: []
        });

        expect(extractor.getStats().numberOfMessageUsages).toBe(5);
        expect(extractor.getStats().numberOfMessages).toBe(3);
        expect(extractor.getStats().numberOfPluralMessages).toBe(0);
        expect(extractor.getStats().numberOfContexts).toBe(3);
    });
});
