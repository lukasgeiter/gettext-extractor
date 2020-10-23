import { GettextExtractor, JsExtractors } from '../../../dist';
import { IJsExtractorFunction } from '../../../dist/js/parser';
import { IMessage } from '../../../dist/builder';
import { trimIndent } from '../../indent';

describe('matching', () => {

    test('optional this', assertMessages(
        JsExtractors.callExpression('[this].service.getText', {
            arguments: {
                text: 0
            }
        }),
        `
            service.getText('Foo');
            this.service.getText('Bar');
        `,
        {
            text: 'Bar'
        },
        {
            text: 'Foo'
        }
    ));

    test('no this', assertMessages(
        JsExtractors.callExpression('service.getText', {
            arguments: {
                text: 0
            }
        }),
        `
            service.getText('Foo');
            this.service.getText('Bar');
        `,
        {
            text: 'Foo'
        }
    ));

    test('required this', assertMessages(
        JsExtractors.callExpression('this.service.getText', {
            arguments: {
                text: 0
            }
        }),
        `
            service.getText('Foo');
            this.service.getText('Bar');
        `,
        {
            text: 'Bar'
        }
    ));

    test('function', assertMessages(
        JsExtractors.callExpression('getText', {
            arguments: {
                text: 0
            }
        }),
        `
            getText('Foo');
            this.getText('Bar');
        `,
        {
            text: 'Foo'
        }
    ));

    test('case sensitivity', assertMessages(
        JsExtractors.callExpression('service.getText', {
            arguments: {
                text: 0
            }
        }),
        `
            service.gettext('Foo');
            Service.getText('Foo');
            Service.gettext('Foo');
        `
    ));

    test('multiple signatures', assertMessages(
        JsExtractors.callExpression(['getText', '[this].service.getText'], {
            arguments: {
                text: 0
            }
        }),
        `
            getText('Foo');
            this.service.getText('Bar');
            service.getText('Baz');
        `,
        {
            text: 'Bar'
        },
        {
            text: 'Baz'
        },
        {
            text: 'Foo'
        }
    ));
});

describe('extraction', () => {

    describe('singular', () => {

        test('text only', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 0,
                    context: 1
                }
            }),
            `
                service.getText('Foo');
                service.getText(Bar);
            `,
            {
                text: 'Foo'
            }
        ));

        test('with context', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 0,
                    context: 1
                }
            }),
            `
                service.getText('Foo', 'Context');
                service.getText('Bar', Context);
            `,
            {
                text: 'Bar'
            },
            {
                text: 'Foo',
                context: 'Context'
            }
        ));

        test('no context argument mapping', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 0
                }
            }),
            `
                service.getText('Foo', 'Context');
            `,
            {
                text: 'Foo'
            }
        ));

        test('weird argument mapping', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 2,
                    context: 0
                }
            }),
            `
                service.getText('Context', something, 'Foo');
            `,
            {
                text: 'Foo',
                context: 'Context'
            }
        ));

        test('template literals', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 0,
                    context: 1
                }
            }),
            `
                service.getText(\`Foo\`);
                service.getText(\`Foo\`, \`Context\`);
                service.getText(\`Bar \${substitution}\`);
            `,
            {
                text: 'Foo'
            },
            {
                text: 'Foo',
                context: 'Context'
            }
        ));

        test('multi-line template literals', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 0,
                    context: 1
                }
            }),
            `
                service.getText(
                    \`Line one
                    Line two
                    Line three\`
                );
            `,
            {
                text: 'Line one\n    Line two\n    Line three'
            }
        ));

        test('concatenated srings', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 0,
                    context: 1
                }
            }),
            `
                service.getText("Foo " + 'bar ' + \`template literal\`);
                service.getText('Foo' + variable);
                service.getText(\`template \` + "string1 " + "string2");
                service.getText('string' + 10);
                service.getText(\`Bar \${substitution}\`);
            `,
            {
                text: 'Foo bar template literal'
            },
            {
                text: 'template string1 string2'
            }
        ));

        test('content options', assertMessages(
            JsExtractors.callExpression('service.getText', {
                arguments: {
                    text: 0,
                    context: 1
                },
                content: {
                    trimWhiteSpace: true,
                    preserveIndentation: false,
                    replaceNewLines: ' '
                }
            }),
            `
                service.getText(
                    \`Line one
                    Line two
                    Line three\`
                );
            `,
            {
                text: 'Line one Line two Line three'
            }
        ));
    });

    describe('plural', () => {

        test('text only', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2,
                    context: 3
                }
            }),
            `
                service.getPlural(1, 'Foo', 'Foos');
                service.getPlural(1, Bar, 'Bars');
                service.getPlural(1, 'Bar', Bars);
            `,
            {
                text: 'Foo',
                textPlural: 'Foos'
            }
        ));

        test('with context', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2,
                    context: 3
                }
            }),
            `
                service.getPlural(1, 'Foo', 'Foos', 'Context');
                service.getPlural(1, 'Bar', 'Bars', Context);
            `,
            {
                text: 'Bar',
                textPlural: 'Bars'
            },
            {
                text: 'Foo',
                textPlural: 'Foos',
                context: 'Context'
            }
        ));

        test('no context argument mapping', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2
                }
            }),
            `
                service.getPlural(1, 'Foo', 'Foos', 'Context');
            `,
            {
                text: 'Foo',
                textPlural: 'Foos'
            }
        ));

        test('weird argument mapping', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
                arguments: {
                    text: 2,
                    textPlural: 4,
                    context: 0
                }
            }),
            `
                service.getPlural('Context', something, 'Foo', something, 'Foos');
            `,
            {
                text: 'Foo',
                textPlural: 'Foos',
                context: 'Context'
            }
        ));

        test('template literals', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2,
                    context: 3
                }
            }),
            `
                service.getPlural(1, \`Foo\`, \`Foos\`);
                service.getPlural(1, \`Foo\`, \`Foos\`, \`Context\`);
                service.getPlural(1, \`\${count} Bar\`, \`\${count} Bars);
            `,
            {
                text: 'Foo',
                textPlural: 'Foos'
            },
            {
                text: 'Foo',
                textPlural: 'Foos',
                context: 'Context'
            }
        ));

        test('multi-line template literals', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2,
                    context: 3
                }
            }),
            `
                service.getPlural(1,
                    \`Line one
                    Line two
                    Line three\`,
                    \`Line ones
                    Line twos
                    Line threes\`
                );
            `,
            {
                text: 'Line one\n    Line two\n    Line three',
                textPlural: 'Line ones\n    Line twos\n    Line threes'
            }
        ));

        test('concatenated strings', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
                arguments: {
                    text: 1,
                    textPlural: 2,
                    context: 3
                }
            }),
            `
                service.getPlural(1, 'Foo', 'Foo' + 's');
                service.getPlural(1, 'Foo', 'Foo' + \`s\`);
                service.getPlural(2, 'Foo', "F" + 'o' + 'o' + \`s\`);
                service.getPlural(3, 'Foo' + 1 + 'bar');
                service.getPlural(\'Foo\', \'Bar\' + \`\${counter}\`);
            `,
            {
                text: 'Foo',
                textPlural: 'Foos'
            }
        ));

        test('content options', assertMessages(
            JsExtractors.callExpression('service.getPlural', {
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
            }),
            `
                service.getPlural(1,
                    \`Line one
                    Line two
                    Line three\`,
                    \`Line ones
                    Line twos
                    Line threes\`
                );
            `,
            {
                text: 'Line one Line two Line three',
                textPlural: 'Line ones Line twos Line threes'
            }
        ));
    });
});

describe('argument validation', () => {

    test('calleeName: (none)', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)();
        }).toThrowError(`Missing argument 'calleeName'`);
    });

    test('calleeName: null', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)(null);
        }).toThrowError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
    });

    test('calleeName: wrong type', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)(42);
        }).toThrowError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
    });

    test('calleeName: [string, wrong type]', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)(['service', 42]);
        }).toThrowError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
    });

    test('options: (none)', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText');
        }).toThrowError(`Missing argument 'options'`);
    });

    test('options: null', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', null);
        }).toThrowError(`Argument 'options' must be an object`);
    });

    test('options: wrong type', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', 42);
        }).toThrowError(`Argument 'options' must be an object`);
    });

    test('options.arguments: (none)', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {});
        }).toThrowError(`Property 'options.arguments' must be an object`);
    });

    test('options.arguments: null', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: null
            });
        }).toThrowError(`Property 'options.arguments' must be an object`);
    });

    test('options.arguments: wrong type', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: 42
            });
        }).toThrowError(`Property 'options.arguments' must be an object`);
    });

    test('options.arguments.text: (none)', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {}
            });
        }).toThrowError(`Property 'options.arguments.text' is missing`);
    });

    test('options.arguments.text: null', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {
                    text: null
                }
            });
        }).toThrowError(`Property 'options.arguments.text' must be a number`);
    });

    test('options.arguments.text: wrong type', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {
                    text: 'Foo'
                }
            });
        }).toThrowError(`Property 'options.arguments.text' must be a number`);
    });

    test('options.arguments.textPlural: null', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {
                    text: 1,
                    textPlural: null
                }
            });
        }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
    });

    test('options.arguments.textPlural: wrong type', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {
                    text: 1,
                    textPlural: 'Foo'
                }
            });
        }).toThrowError(`Property 'options.arguments.textPlural' must be a number`);
    });

    test('options.arguments.context: null', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {
                    text: 1,
                    context: null
                }
            });
        }).toThrowError(`Property 'options.arguments.context' must be a number`);
    });

    test('options.arguments.context: wrong type', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {
                    text: 1,
                    context: 'Foo'
                }
            });
        }).toThrowError(`Property 'options.arguments.context' must be a number`);
    });

    test('options.comments.regex: null', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
                arguments: {
                    text: 1
                },
                content: 'foo'
            });
        }).toThrowError(`Property 'options.content' must be an object`);
    });

    test('options.content.trimWhiteSpace: wrong type', () => {
        expect(() => {
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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
            (<any>JsExtractors.callExpression)('service.getText', {
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

function assertMessages(extractorFunction: IJsExtractorFunction, source: string, ...expected: Partial<IMessage>[]): () => void {
    return () => {
        let extractor = new GettextExtractor();

        extractor.createJsParser([extractorFunction]).parseString(trimIndent(source));

        expect(extractor.getMessages()).toStrictEqual(
            expected.map(message => ({
                textPlural: null,
                context: null,
                comments: [],
                references: [],
                ...message
            }))
        );
    };
}
