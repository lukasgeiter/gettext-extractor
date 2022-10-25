import { IHtmlExtractorFunction } from '../../../dist/html/parser';
import { IMessage } from '../../../dist/builder';
import { GettextExtractor, HtmlExtractors } from '../../../dist';
import { trimIndent } from '../../indent';

describe('standard', () => {

    test('just text', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate text="Foo"></translate>`,
        {
            text: 'Foo'
        }
    ));

    test('with context', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate text="Foo" context="Context"></translate>`,
        {
            text: 'Foo',
            context: 'Context'
        }
    ));

    test('plural', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate text="Foo" plural="Foos"></translate>`,
        {
            text: 'Foo',
            textPlural: 'Foos'
        }
    ));

    test('plural with context', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate text="Foo" plural="Foos" context="Context"></translate>`,
        {
            text: 'Foo',
            textPlural: 'Foos',
            context: 'Context'
        }
    ));

    test('missing text', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate plural="Foos" context="Context"></translate>`
    ));
});

describe('just text', () => {

    test('with context', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text'),
        `<translate text="Foo" context="Context?"></translate>`,
        {
            text: 'Foo'
        }
    ));

    test('plural', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text'),
        `<translate text="Foo" plural="Foos?"></translate>`,
        {
            text: 'Foo'
        }
    ));

    test('plural with context', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text'),
        `<translate text="Foo" plural="Foos?" context="Context?"></translate>`,
        {
            text: 'Foo'
        }
    ));
});

describe('comment', () => {

    test('just text', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                comment: 'comment'
            }
        }),
        `<translate text="Foo"></translate>`,
        {
            text: 'Foo'
        }
    ));

    test('with comment', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                comment: 'comment'
            }
        }),
        `<translate text="Foo" comment="Foo Bar"></translate>`,
        {
            text: 'Foo',
            comments: [
                'Foo Bar'
            ]
        }
    ));

    test('empty comment', assertMessages(
        HtmlExtractors.elementAttribute('translate', 'text', {
            attributes: {
                comment: 'comment'
            }
        }),
        `<translate text="Foo" comment=""></translate>`,
        {
            text: 'Foo'
        }
    ));
});

describe('argument validation', () => {

    test('selector: (none)', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)();
        }).toThrowError(`Missing argument 'selector'`);
    });

    test('selector: null', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)(null);
        }).toThrowError(`Argument 'selector' must be a non-empty string`);
    });

    test('selector: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)(42);
        }).toThrowError(`Argument 'selector' must be a non-empty string`);
    });

    test('textAttribute: (none)', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]');
        }).toThrowError(`Missing argument 'textAttribute'`);
    });

    test('textAttribute: null', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', null);
        }).toThrowError(`Argument 'textAttribute' must be a non-empty string`);
    });

    test('textAttribute: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 42);
        }).toThrowError(`Argument 'textAttribute' must be a non-empty string`);
    });

    test('options: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', 'foo');
        }).toThrowError(`Argument 'options' must be an object`);
    });

    test('options.attributes: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                attributes: 'foo'
            });
        }).toThrowError(`Property 'options.attributes' must be an object`);
    });

    test('options.attributes.textPlural: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                attributes: {
                    textPlural: 42
                }
            });
        }).toThrowError(`Property 'options.attributes.textPlural' must be a string`);
    });

    test('options.attributes.context: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                attributes: {
                    context: 42
                }
            });
        }).toThrowError(`Property 'options.attributes.context' must be a string`);
    });

    test('options.attributes.comment: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                attributes: {
                    comment: 42
                }
            });
        }).toThrowError(`Property 'options.attributes.comment' must be a string`);
    });

    test('options.content: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                content: 'foo'
            });
        }).toThrowError(`Property 'options.content' must be an object`);
    });

    test('options.content.trimWhiteSpace: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                content: {
                    trimWhiteSpace: 'foo'
                }
            });
        }).toThrowError(`Property 'options.content.trimWhiteSpace' must be a boolean`);
    });

    test('options.content.preserveIndentation: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                content: {
                    preserveIndentation: 'foo'
                }
            });
        }).toThrowError(`Property 'options.content.preserveIndentation' must be a boolean`);
    });

    test('options.content.replaceNewLines: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                content: {
                    replaceNewLines: 42
                }
            });
        }).toThrowError(`Property 'options.content.replaceNewLines' must be false or a string`);
    });

    test('options.content.replaceNewLines: true', () => {
        expect(() => {
            (<any>HtmlExtractors.elementAttribute)('[translate]', 'translate', {
                content: {
                    replaceNewLines: true
                }
            });
        }).toThrowError(`Property 'options.content.replaceNewLines' must be false or a string`);
    });
});

function assertMessages(extractorFunction: IHtmlExtractorFunction, source: string, ...expected: Partial<IMessage>[]): () => void {
    return () => {
        let extractor = new GettextExtractor();

        extractor.createHtmlParser([extractorFunction]).parseString(source);

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
