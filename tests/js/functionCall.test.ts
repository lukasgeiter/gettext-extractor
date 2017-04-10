import { CatalogBuilder, IMessage } from '../../src/builder';
import { IOptions, JsExtractors } from '../../src/js/extractors';
import { JsParser } from '../../src/js/parser';

describe('JS: Function Call Extractor', () => {

    let builder: CatalogBuilder,
        parser: JsParser,
        messages: IMessage[];

    beforeEach(() => {
        messages = [];

        builder = <any>{
            addMessage: jest.fn((message: IMessage) => {
                messages.push(message);
            })
        };
    });

    describe('extraction', () => {
        function createParser(functionName: string, options: IOptions): JsParser {
            return new JsParser(builder, [
                JsExtractors.functionCall(functionName, options)
            ]);
        }

        describe('singular', () => {
            beforeEach(() => {
                parser = createParser('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    }
                });
            });

            test('text only', () => {
                parser.parseString(`getText('Foo');`);
                parser.parseString(`getText(Bar);`);

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    }
                ]);
            });

            test('with context', () => {
                parser.parseString(`getText('Foo', 'Context');`);
                parser.parseString(`getText('Bar', Context);`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        context: 'Context'
                    },
                    {
                        text: 'Bar'
                    }
                ]);
            });

            test('no context argument mapping', () => {
                parser = createParser('getText', {
                    arguments: {
                        text: 0
                    }
                });

                parser.parseString(`getText('Foo', 'Context');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    }
                ]);
            });

            test('weird argument mapping', () => {
                parser = createParser('getText', {
                    arguments: {
                        text: 2,
                        context: 0
                    }
                });

                parser.parseString(`getText('Context', something, 'Foo');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        context: 'Context'
                    }
                ]);
            });
        });

        describe('plural', () => {
            beforeEach(() => {
                parser = createParser('getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2,
                        context: 3
                    }
                });
            });

            test('text only', () => {
                parser.parseString(`getPlural(1, 'Foo', 'Foos');`);
                parser.parseString(`getPlural(1, Bar, 'Bars');`);
                parser.parseString(`getPlural(1, 'Bar', Bars);`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    }
                ]);
            });

            test('with context', () => {
                parser.parseString(`getPlural(1, 'Foo', 'Foos', 'Context');`);
                parser.parseString(`getPlural(1, 'Bar', 'Bars', Context);`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos',
                        context: 'Context'
                    },
                    {
                        text: 'Bar',
                        textPlural: 'Bars'
                    }
                ]);
            });

            test('no context argument mapping', () => {
                parser = createParser('getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2
                    }
                });

                parser.parseString(`getPlural(1, 'Foo', 'Foos', 'Context');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    }
                ]);
            });

            test('weird argument mapping', () => {
                parser = createParser('getPlural', {
                    arguments: {
                        text: 2,
                        textPlural: 4,
                        context: 0
                    }
                });

                parser.parseString(`getPlural('Context', something, 'Foo', something, 'Foos');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos',
                        context: 'Context'
                    }
                ]);
            });
        });
    });

    describe('matching', () => {
        function createParser(functionName: string): JsParser {
            return new JsParser(builder, [
                JsExtractors.functionCall(functionName, {
                    arguments: {
                        text: 0
                    }
                })
            ]);
        }

        test('standard use', () => {
            parser = createParser('getText');

            parser.parseString(`getText('Foo');`);
            parser.parseString(`this.getText('Bar');`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('case sensitivity', () => {
            parser = createParser('getText');

            parser.parseString(`gettext('Foo');`);

            expect(messages).toEqual([]);
        });

        test('method call', () => {
            parser = createParser('getText');

            parser.parseString(`service.getText('Foo')`);

            expect(messages).toEqual([]);
        });
    });

    describe('argument validation', () => {
        test('functionName: (none)', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)();
            }).toThrowError(`Missing argument 'functionName'`);
        });

        test('functionName: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)(null);
            }).toThrowError(`Argument 'functionName' must be a non-empty string`);
        });

        test('functionName: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)(42);
            }).toThrowError(`Argument 'functionName' must be a non-empty string`);
        });

        test('options: (none)', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText');
            }).toThrowError(`Missing argument 'options'`);
        });

        test('options: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', null);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', 42);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.arguments: (none)', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {});
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: null
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: 42
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments.text: (none)', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {}
                });
            }).toThrowError(`Property 'options.arguments.text' is missing`);
        });

        test('options.arguments.text: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.text' must be a number`);
        });

        test('options.arguments.text: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.text' must be a number`);
        });

        test('options.arguments.textPlural: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1,
                        textPlural: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
        });

        test('options.arguments.textPlural: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1,
                        textPlural: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
        });

        test('options.arguments.context: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1,
                        context: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.context' must be a number`);
        });

        test('options.arguments.context: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1,
                        context: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.context' must be a number`);
        });

        test('options.comments.regex: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        regex: null
                    }
                });
            }).toThrowError(`Property 'options.comments.regex' must be a regular expression`);
        });

        test('options.comments.regex: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        regex: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.comments.regex' must be a regular expression`);
        });

        test('options.comments.otherLineLeading: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        otherLineLeading: null
                    }
                });
            }).toThrowError(`Property 'options.comments.otherLineLeading' must be a boolean`);
        });

        test('options.comments.otherLineLeading: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        otherLineLeading: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.comments.otherLineLeading' must be a boolean`);
        });

        test('options.comments.sameLineLeading: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        sameLineLeading: null
                    }
                });
            }).toThrowError(`Property 'options.comments.sameLineLeading' must be a boolean`);
        });

        test('options.comments.sameLineLeading: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        sameLineLeading: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.comments.sameLineLeading' must be a boolean`);
        });

        test('options.comments.sameLineTrailing: null', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        sameLineTrailing: null
                    }
                });
            }).toThrowError(`Property 'options.comments.sameLineTrailing' must be a boolean`);
        });

        test('options.comments.sameLineTrailing: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.functionCall)('getText', {
                    arguments: {
                        text: 1
                    },
                    comments: {
                        sameLineTrailing: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.comments.sameLineTrailing' must be a boolean`);
        });
    });
});
