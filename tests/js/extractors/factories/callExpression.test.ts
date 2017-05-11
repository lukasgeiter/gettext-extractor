import { CatalogBuilder, IMessage } from '../../../../src/builder';
import { JsParser } from '../../../../src/js/parser';
import { callExpressionExtractor } from '../../../../src/js/extractors/factories/callExpression';
import { IJsExtractorOptions } from '../../../../src/js/extractors/common';

describe('JS: Call Expression Extractor', () => {

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

        function createParser(calleeName: string | string[], options: IJsExtractorOptions): JsParser {
            return new JsParser(builder, [
                callExpressionExtractor(calleeName, options)
            ]);
        }

        describe('singular', () => {

            beforeEach(() => {
                parser = createParser('service.getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    }
                });
            });

            test('text only', () => {
                parser.parseString(`service.getText('Foo');`);
                parser.parseString(`service.getText(Bar);`);

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    }
                ]);
            });

            test('with context', () => {
                parser.parseString(`service.getText('Foo', 'Context');`);
                parser.parseString(`service.getText('Bar', Context);`);

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
                parser = createParser('service.getText', {
                    arguments: {
                        text: 0
                    }
                });

                parser.parseString(`service.getText('Foo', 'Context');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    }
                ]);
            });

            test('weird argument mapping', () => {
                parser = createParser('service.getText', {
                    arguments: {
                        text: 2,
                        context: 0
                    }
                });

                parser.parseString(`service.getText('Context', something, 'Foo');`);

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
                parser = createParser('service.getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2,
                        context: 3
                    }
                });
            });

            test('text only', () => {
                parser.parseString(`service.getPlural(1, 'Foo', 'Foos');`);
                parser.parseString(`service.getPlural(1, Bar, 'Bars');`);
                parser.parseString(`service.getPlural(1, 'Bar', Bars);`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    }
                ]);
            });

            test('with context', () => {
                parser.parseString(`service.getPlural(1, 'Foo', 'Foos', 'Context');`);
                parser.parseString(`service.getPlural(1, 'Bar', 'Bars', Context);`);

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
                parser = createParser('service.getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2
                    }
                });

                parser.parseString(`service.getPlural(1, 'Foo', 'Foos', 'Context');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    }
                ]);
            });

            test('weird argument mapping', () => {
                parser = createParser('service.getPlural', {
                    arguments: {
                        text: 2,
                        textPlural: 4,
                        context: 0
                    }
                });

                parser.parseString(`service.getPlural('Context', something, 'Foo', something, 'Foos');`);

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

        function createParser(calleeName: string | string[]): JsParser {
            return new JsParser(builder, [
                callExpressionExtractor(calleeName, {
                    arguments: {
                        text: 0
                    }
                })
            ]);
        }

        describe('one call signature', () => {
            test('optional this', () => {
                parser = createParser('[this].service.getText');

                parser.parseString(`service.getText('Foo');`);
                parser.parseString(`this.service.getText('Bar');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    },
                    {
                        text: 'Bar'
                    }
                ]);
            });

            test('no this', () => {
                parser = createParser('service.getText');

                parser.parseString(`service.getText('Foo');`);
                parser.parseString(`this.service.getText('Bar');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    }
                ]);
            });

            test('required this', () => {
                parser = createParser('this.service.getText');

                parser.parseString(`service.getText('Foo');`);
                parser.parseString(`this.service.getText('Bar');`);

                expect(messages).toEqual([
                    {
                        text: 'Bar'
                    }
                ]);
            });

            test('function', () => {
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
                parser = createParser('service.getText');

                parser.parseString(`service.gettext('Foo');`);
                parser.parseString(`Service.getText('Foo');`);
                parser.parseString(`Service.gettext('Foo');`);

                expect(messages).toEqual([]);
            });
        });

        describe('multiple call signatures', () => {
            test('???', () => {
                parser = createParser(['getText', '[this].service.getText']);

                parser.parseString(`getText('Foo');`);
                parser.parseString(`this.service.getText('Bar');`);
                parser.parseString(`service.getText('Baz');`);

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    },
                    {
                        text: 'Bar'
                    },
                    {
                        text: 'Baz'
                    }
                ]);
            });
        });
    });

    describe('argument validation', () => {

        test('calleeName: (none)', () => {
            expect(() => {
                (<any>callExpressionExtractor)();
            }).toThrowError(`Missing argument 'calleeName'`);
        });

        test('calleeName: null', () => {
            expect(() => {
                (<any>callExpressionExtractor)(null);
            }).toThrowError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        });

        test('calleeName: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)(42);
            }).toThrowError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        });

        test('calleeName: [string, wrong type]', () => {
            expect(() => {
                (<any>callExpressionExtractor)(['service', 42]);
            }).toThrowError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        });

        test('options: (none)', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText');
            }).toThrowError(`Missing argument 'options'`);
        });

        test('options: null', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', null);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', 42);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.arguments: (none)', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {});
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: null', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: null
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: 42
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments.text: (none)', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {}
                });
            }).toThrowError(`Property 'options.arguments.text' is missing`);
        });

        test('options.arguments.text: null', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.text' must be a number`);
        });

        test('options.arguments.text: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.text' must be a number`);
        });

        test('options.arguments.textPlural: null', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1,
                        textPlural: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
        });

        test('options.arguments.textPlural: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1,
                        textPlural: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
        });

        test('options.arguments.context: null', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1,
                        context: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.context' must be a number`);
        });

        test('options.arguments.context: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1,
                        context: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.context' must be a number`);
        });

        test('options.comments.regex: null', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
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
                (<any>callExpressionExtractor)('service.getText', {
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
                (<any>callExpressionExtractor)('service.getText', {
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
                (<any>callExpressionExtractor)('service.getText', {
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
                (<any>callExpressionExtractor)('service.getText', {
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
                (<any>callExpressionExtractor)('service.getText', {
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
                (<any>callExpressionExtractor)('service.getText', {
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
                (<any>callExpressionExtractor)('service.getText', {
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
