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

            test('template literals', () => {
                parser.parseString('service.getText(`Foo`);');
                parser.parseString('service.getText(`Foo`, `Context`);');
                parser.parseString('service.getText(`Bar ${substitution}`);');

                expect(messages).toEqual([
                    {
                        text: 'Foo'
                    },
                    {
                        text: 'Foo',
                        context: 'Context'
                    }
                ]);
            });

            test('multi-line template literals', () => {
                parser.parseString(`service.getText(
                    \`Line one
                    Line two
                    Line three\`
                );`);

                expect(messages).toEqual([
                    {
                        text: 'Line one\n                    Line two\n                    Line three'
                    }
                ]);
            });

            test('HTML inside a template string with substitution', () => {
                parser.parseString(`
                let tuce = \`
                    <div>
                        \${service.getText('First level')}
                        <div>
                            \${service.getText('Second level')}
                            <div> \${service.getText('Third level')} </div>
                        </div>
                    </div>\`
                `);

                expect(messages).toEqual([
                    {
                        text: 'First level',
                    },
                    {
                        text: 'Second level',
                    },
                    {
                        text: 'Third level',
                    },
                ])
            });

            test('concatenated srings', () => {
                parser.parseString('service.getText("Foo " + \'bar \' + `template literal`);');
                parser.parseString(`service.getText('Foo' + variable);`);
                parser.parseString('service.getText(\`template \` + "string1 " + "string2"');
                parser.parseString(`service.getText('string' + 10);`);
                parser.parseString('service.getText(`Bar ${substitution}`);');

                expect(messages).toEqual([
                    {
                        text: 'Foo bar template literal'
                    },
                    {
                        text: 'template string1 string2'
                    }
                ]);
            });

            test('content options', () => {
                parser = createParser('service.getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    },
                    content: {
                        trimWhiteSpace: true,
                        preserveIndentation: false,
                        replaceNewLines: ' '
                    }
                });

                parser.parseString(`service.getText(
                    \`Line one
                    Line two
                    Line three\`
                );`);

                expect(messages).toEqual([
                    {
                        text: 'Line one Line two Line three'
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

            test('template literals', () => {
                parser.parseString('service.getPlural(1, `Foo`, `Foos`);');
                parser.parseString('service.getPlural(1, `Foo`, `Foos`, `Context`);');
                parser.parseString('service.getPlural(1, `${count} Bar`, `${count} Bars);');

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    },
                    {
                        text: 'Foo',
                        textPlural: 'Foos',
                        context: 'Context'
                    }
                ]);
            });

            test('multi-line template literals', () => {
                parser.parseString(`service.getPlural(1,
                    \`Line one
                    Line two
                    Line three\`,
                    \`Line ones
                    Line twos
                    Line threes\`
                );`);

                expect(messages).toEqual([
                    {
                        text: 'Line one\n                    Line two\n                    Line three',
                        textPlural: 'Line ones\n                    Line twos\n                    Line threes'
                    }
                ]);
            });

            test('concatenated strings', () => {
                parser.parseString(`service.getPlural(1, 'Foo', 'Foo' + 's');`);
                parser.parseString(`service.getPlural(1, 'Foo', 'Foo' + \`s\`);`);
                parser.parseString(`service.getPlural(2, 'Foo', "F" + 'o' + 'o' + \`s\`);`);
                parser.parseString(`service.getPlural(3, 'Foo' + 1 + 'bar');`);
                parser.parseString('service.getPlural(\'Foo\', \'Bar\' + \`${counter}\`);');

                expect(messages).toEqual([
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    },
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    },
                    {
                        text: 'Foo',
                        textPlural: 'Foos'
                    }
                ]);

            });

            test('content options', () => {
                parser = createParser('service.getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2,
                        context: 3
                    },
                    content: {
                        trimWhiteSpace: true,
                        preserveIndentation: false,
                        replaceNewLines: ' '
                    }
                });

                parser.parseString(`service.getPlural(1,
                    \`Line one
                    Line two
                    Line three\`,
                    \`Line ones
                    Line twos
                    Line threes\`
                );`);

                expect(messages).toEqual([
                    {
                        text: 'Line one Line two Line three',
                        textPlural: 'Line ones Line twos Line threes'
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

        test('options.content: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1
                    },
                    content: 'foo'
                });
            }).toThrowError(`Property 'options.content' must be an object`);
        });

        test('options.content.trimWhiteSpace: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1
                    },
                    content: {
                        trimWhiteSpace: 'foo'
                    }
                });
            }).toThrowError(`Property 'options.content.trimWhiteSpace' must be a boolean`);
        });

        test('options.content.preserveIndentation: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1
                    },
                    content: {
                        preserveIndentation: 'foo'
                    }
                });
            }).toThrowError(`Property 'options.content.preserveIndentation' must be a boolean`);
        });

        test('options.content.replaceNewLines: wrong type', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1
                    },
                    content: {
                        replaceNewLines: 42
                    }
                });
            }).toThrowError(`Property 'options.content.replaceNewLines' must be false or a string`);
        });

        test('options.content.replaceNewLines: true', () => {
            expect(() => {
                (<any>callExpressionExtractor)('service.getText', {
                    arguments: {
                        text: 1
                    },
                    content: {
                        replaceNewLines: true
                    }
                });
            }).toThrowError(`Property 'options.content.replaceNewLines' must be false or a string`);
        });
    });
});
