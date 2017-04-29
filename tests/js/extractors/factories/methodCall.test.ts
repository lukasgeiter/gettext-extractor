import { CatalogBuilder, IMessage } from '../../../../src/builder';
import { JsParser } from '../../../../src/js/parser';
import { IMethodCallOptions, methodCallExtractor } from '../../../../src/js/extractors/factories/methodCall';

describe('JS: Method Call Extractor', () => {

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

        function createParser(instanceName: string, methodName: string, options: IMethodCallOptions): JsParser {
            return new JsParser(builder, [
                methodCallExtractor(instanceName, methodName, options)
            ]);
        }

        describe('singular', () => {

            beforeEach(() => {
                parser = createParser('service', 'getText', {
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
                parser = createParser('service', 'getText', {
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
                parser = createParser('service', 'getText', {
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
                parser = createParser('service', 'getPlural', {
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
                parser = createParser('service', 'getPlural', {
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
                parser = createParser('service', 'getPlural', {
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

        function createParser(instanceName: string, methodName: string, ignoreMemberInstance: boolean = undefined): JsParser {
            return new JsParser(builder, [
                methodCallExtractor(instanceName, methodName, {
                    arguments: {
                        text: 0
                    },
                    ignoreMemberInstance: ignoreMemberInstance
                })
            ]);
        }

        test('standard use', () => {
            parser = createParser('service', 'getText');

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

        test('ignoreMemberInstance: false', () => {
            parser = createParser('service', 'getText', false);

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

        test('ignoreMemberInstance: true', () => {
            parser = createParser('service', 'getText', true);

            parser.parseString(`service.getText('Foo');`);
            parser.parseString(`this.service.getText('Bar');`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('case sensitivity', () => {
            parser = createParser('service', 'getText');

            parser.parseString(`service.gettext('Foo');`);
            parser.parseString(`Service.getText('Foo');`);
            parser.parseString(`Service.gettext('Foo');`);

            expect(messages).toEqual([]);
        });

        test('function call', () => {
            parser = createParser('service', 'getText');

            parser.parseString(`getText('Foo')`);

            expect(messages).toEqual([]);
        });
    });

    describe('argument validation', () => {

        test('instanceName: (none)', () => {
            expect(() => {
                (<any>methodCallExtractor)();
            }).toThrowError(`Missing argument 'instanceName'`);
        });

        test('instanceName: null', () => {
            expect(() => {
                (<any>methodCallExtractor)(null);
            }).toThrowError(`Argument 'instanceName' must be a non-empty string`);
        });

        test('instanceName: wrong type', () => {
            expect(() => {
                (<any>methodCallExtractor)(42);
            }).toThrowError(`Argument 'instanceName' must be a non-empty string`);
        });

        test('methodName: (none)', () => {
            expect(() => {
                (<any>methodCallExtractor)('service');
            }).toThrowError(`Missing argument 'methodName'`);
        });

        test('methodName: null', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', null);
            }).toThrowError(`Argument 'methodName' must be a non-empty string`);
        });

        test('methodName: wrong type', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 42);
            }).toThrowError(`Argument 'methodName' must be a non-empty string`);
        });

        test('options: (none)', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText');
            }).toThrowError(`Missing argument 'options'`);
        });

        test('options: null', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', null);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', 42);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.arguments: (none)', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {});
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: null', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: null
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: wrong type', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: 42
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments.text: (none)', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: {}
                });
            }).toThrowError(`Property 'options.arguments.text' is missing`);
        });

        test('options.arguments.text: null', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: {
                        text: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.text' must be a number`);
        });

        test('options.arguments.text: wrong type', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: {
                        text: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.text' must be a number`);
        });

        test('options.arguments.textPlural: null', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: {
                        text: 1,
                        textPlural: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
        });

        test('options.arguments.textPlural: wrong type', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: {
                        text: 1,
                        textPlural: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
        });

        test('options.arguments.context: null', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: {
                        text: 1,
                        context: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.context' must be a number`);
        });

        test('options.arguments.context: wrong type', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
                    arguments: {
                        text: 1,
                        context: 'Foo'
                    }
                });
            }).toThrowError(`Property 'options.arguments.context' must be a number`);
        });

        test('options.comments.regex: null', () => {
            expect(() => {
                (<any>methodCallExtractor)('service', 'getText', {
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
                (<any>methodCallExtractor)('service', 'getText', {
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
                (<any>methodCallExtractor)('service', 'getText', {
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
                (<any>methodCallExtractor)('service', 'getText', {
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
                (<any>methodCallExtractor)('service', 'getText', {
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
                (<any>methodCallExtractor)('service', 'getText', {
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
                (<any>methodCallExtractor)('service', 'getText', {
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
                (<any>methodCallExtractor)('service', 'getText', {
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
