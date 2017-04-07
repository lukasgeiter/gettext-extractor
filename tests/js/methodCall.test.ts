import { CatalogBuilder, IMessage } from '../../src/builder';
import { JsExtractors } from '../../src/js/extractors';
import { JsParser } from '../../src/js/parser';

describe('JS: Method Call Extractor', () => {

    function standardSingular(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getText', {
                arguments: {
                    text: 0,
                    context: 1
                }
            })
        ]);
    }

    function standardPlural(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2,
                    context: 3
                }
            })
        ]);
    }

    function noContextSingular(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getText', {
                arguments: {
                    text: 0
                }
            })
        ]);
    }

    function noContextPlural(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2
                }
            })
        ]);
    }

    function weirdSingular(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getText', {
                arguments: {
                    text: 2,
                    context: 0
                }
            })
        ]);
    }

    function weirdPlural(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getPlural', {
                arguments: {
                    text: 2,
                    textPlural: 4,
                    context: 0
                }
            })
        ]);
    }

    function ignoreMemberInstanceSingular(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getText', {
                ignoreMemberInstance: true,
                arguments: {
                    text: 0,
                    context: 1
                }
            })
        ]);
    }

    function ignoreMemberInstancePlural(): JsParser {
        return new JsParser(builder, [
            JsExtractors.methodCall('service', 'getPlural', {
                ignoreMemberInstance: true,
                arguments: {
                    text: 1,
                    textPlural: 2,
                    context: 3
                }
            })
        ]);
    }

    let builder: CatalogBuilder,
        messages: IMessage[];

    beforeEach(() => {
        messages = [];

        builder = <any>{
            addMessage: jest.fn((message: IMessage) => {
                messages.push(message);
            })
        };
    });

    describe('singular', () => {
        test('basic call', () => {
            standardSingular().parseString(`service.getText('Foo');`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('context', () => {
            standardSingular().parseString(`service.getText('Foo', 'Context');`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    context: 'Context'
                }
            ]);
        });

        test('member method', () => {
            standardSingular().parseString(`this.getText('Foo');`);

            expect(messages).toEqual([]);
        });

        test('member instance method', () => {
            standardSingular().parseString(`this.service.getText('Foo');`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('member instance method (ignoreMemberInstance)', () => {
            ignoreMemberInstanceSingular().parseString(`this.service.getText('Foo');`);

            expect(messages).toEqual([]);
        });

        test('function call', () => {
            standardSingular().parseString(`getText('Foo');`);

            expect(messages).toEqual([]);
        });

        test('non-literal parameter', () => {
            standardSingular().parseString(`service.getText(foo);`);

            expect(messages).toEqual([]);
        });

        test('case sensitivity', () => {
            standardSingular().parseString(`service.gettext('Foo');`);

            expect(messages).toEqual([]);
        });

        test('no context argument mapping', () => {
            noContextSingular().parseString(`service.getText('Foo', 'Context?');`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('weird argument mapping', () => {
            weirdSingular().parseString(`service.getText('Context', something, 'Foo');`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    context: 'Context'
                }
            ]);
        });
    });

    describe('plural', () => {
        test('basic call', () => {
            standardPlural().parseString(`service.getPlural(1, 'Foo', 'Foos');`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos'
                }
            ]);
        });

        test('context', () => {
            standardPlural().parseString(`service.getPlural(1, 'Foo', 'Foos', 'Context');`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos',
                    context: 'Context'
                }
            ]);
        });

        test('member method', () => {
            standardPlural().parseString(`this.getPlural(1, 'Foo', 'Foos');`);

            expect(messages).toEqual([]);
        });

        test('member instance method', () => {
            standardPlural().parseString(`this.service.getPlural(1, 'Foo', 'Foos');`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos'
                }
            ]);
        });

        test('member instance method (ignoreMemberInstance)', () => {
            ignoreMemberInstancePlural().parseString(`this.service.getPlural(1, 'Foo', 'Foos');`);

            expect(messages).toEqual([]);
        });

        test('function call', () => {
            standardPlural().parseString(`getPlural(1, 'Foo', 'Foos');`);

            expect(messages).toEqual([]);
        });

        test('non-literal parameter (text)', () => {
            standardPlural().parseString(`service.getPlural(1, foo, 'Foos');`);

            expect(messages).toEqual([]);
        });

        test('non-literal parameter (textPlural)', () => {
            standardPlural().parseString(`service.getPlural(1, 'Foo', fooPlural);`);

            expect(messages).toEqual([]);
        });

        test('case sensitivity', () => {
            standardPlural().parseString(`service.getplural(1, 'Foo', 'Foos);`);

            expect(messages).toEqual([]);
        });

        test('no context argument mapping', () => {
            noContextPlural().parseString(`service.getPlural(1, 'Foo', 'Foos', 'Context?');`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos'
                }
            ]);
        });

        test('weird argument mapping', () => {
            weirdPlural().parseString(`service.getPlural('Context', something, 'Foo', something, 'Foos');`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos',
                    context: 'Context'
                }
            ]);
        });
    });

    describe('argument validation', () => {
        test('instanceName: (none)', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)();
            }).toThrowError(`Missing argument 'instanceName'`);
        });

        test('instanceName: null', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)(null);
            }).toThrowError(`Argument 'instanceName' must be a non-empty string`);
        });

        test('instanceName: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)(42);
            }).toThrowError(`Argument 'instanceName' must be a non-empty string`);
        });

        test('methodName: (none)', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service');
            }).toThrowError(`Missing argument 'methodName'`);
        });

        test('methodName: null', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', null);
            }).toThrowError(`Argument 'methodName' must be a non-empty string`);
        });

        test('methodName: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 42);
            }).toThrowError(`Argument 'methodName' must be a non-empty string`);
        });

        test('options: (none)', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText');
            }).toThrowError(`Missing argument 'options'`);
        });

        test('options: null', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', null);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', 42);
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.arguments: (none)', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', {});
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: null', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', {
                    arguments: null
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', {
                    arguments: 42
                });
            }).toThrowError(`Property 'options.arguments' must be an object`);
        });

        test('options.arguments.text: (none)', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', {
                    arguments: {}
                });
            }).toThrowError(`Property 'options.arguments.text' is missing`);
        });

        test('options.arguments.text: null', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', {
                    arguments: {
                        text: null
                    }
                });
            }).toThrowError(`Property 'options.arguments.text' must be a number`);
        });

        test('options.arguments.text: wrong type', () => {
            expect(() => {
                (<any>JsExtractors.methodCall)('service', 'getText', {
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
