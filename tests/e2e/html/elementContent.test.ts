import { GettextExtractor, HtmlExtractors } from '../../../dist';
import { IHtmlExtractorFunction } from '../../../dist/html/parser';
import { IMessage } from '../../../dist/builder';
import { trimIndent } from '../../indent';

describe('standard', () => {

    test('just text', assertMessages(
        HtmlExtractors.elementContent('translate', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate>Foo</translate>`,
        {
            text: 'Foo'
        }
    ));

    test('with context', assertMessages(
        HtmlExtractors.elementContent('translate', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate context="Context">Foo</translate>`,
        {
            text: 'Foo',
            context: 'Context'
        }
    ));

    test('plural', assertMessages(
        HtmlExtractors.elementContent('translate', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate plural="Foos">Foo</translate>`,
        {
            text: 'Foo',
            textPlural: 'Foos'
        }
    ));

    test('plural with context', assertMessages(
        HtmlExtractors.elementContent('translate', {
            attributes: {
                context: 'context',
                textPlural: 'plural'
            }
        }),
        `<translate plural="Foos" context="Context">Foo</translate>`,
        {
            text: 'Foo',
            textPlural: 'Foos',
            context: 'Context'
        }
    ));
});

describe('just text', () => {

    test('with context', assertMessages(
        HtmlExtractors.elementContent('translate'),
        `<translate context="Context?">Foo</translate>`,
        {
            text: 'Foo'
        }
    ));

    test('plural', assertMessages(
        HtmlExtractors.elementContent('translate'),
        `<translate plural="Foos?">Foo</translate>`,
        {
            text: 'Foo'
        }
    ));

    test('plural with context', assertMessages(
        HtmlExtractors.elementContent('translate'),
        `<translate plural="Foos?" context="Context?">Foo</translate>`,
        {
            text: 'Foo'
        }
    ));
});

describe('comment', () => {

    test('just text', assertMessages(
        HtmlExtractors.elementContent('translate', {
            attributes: {
                comment: 'comment'
            }
        }),
        `<translate>Foo</translate>`,
        {
            text: 'Foo'
        }
    ));

    test('with comment', assertMessages(
        HtmlExtractors.elementContent('translate', {
            attributes: {
                comment: 'comment'
            }
        }),
        `<translate comment="Foo Bar">Foo</translate>`,
        {
            text: 'Foo',
            comments: [
                'Foo Bar'
            ]
        }
    ));

    test('empty comment', assertMessages(
        HtmlExtractors.elementContent('translate', {
            attributes: {
                comment: 'comment'
            }
        }),
        `<translate comment="">Foo</translate>`,
        {
            text: 'Foo'
        }
    ));
});

describe('argument validation', () => {

    test('selector: (none)', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)();
        }).toThrowError(`Missing argument 'selector'`);
    });

    test('selector: null', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)(null);
        }).toThrowError(`Argument 'selector' must be a non-empty string`);
    });

    test('selector: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)(42);
        }).toThrowError(`Argument 'selector' must be a non-empty string`);
    });

    test('options: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', 'foo');
        }).toThrowError(`Argument 'options' must be an object`);
    });

    test('options.attributes: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                attributes: 'foo'
            });
        }).toThrowError(`Property 'options.attributes' must be an object`);
    });

    test('options.attributes.textPlural: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                attributes: {
                    textPlural: 42
                }
            });
        }).toThrowError(`Property 'options.attributes.textPlural' must be a string`);
    });

    test('options.attributes.context: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                attributes: {
                    context: 42
                }
            });
        }).toThrowError(`Property 'options.attributes.context' must be a string`);
    });

    test('options.attributes.comment: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                attributes: {
                    comment: 42
                }
            });
        }).toThrowError(`Property 'options.attributes.comment' must be a string`);
    });

    test('options.content: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                content: 'foo'
            });
        }).toThrowError(`Property 'options.content' must be an object`);
    });

    test('options.content.trimWhiteSpace: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                content: {
                    trimWhiteSpace: 'foo'
                }
            });
        }).toThrowError(`Property 'options.content.trimWhiteSpace' must be a boolean`);
    });

    test('options.content.preserveIndentation: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                content: {
                    preserveIndentation: 'foo'
                }
            });
        }).toThrowError(`Property 'options.content.preserveIndentation' must be a boolean`);
    });

    test('options.content.replaceNewLines: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
                content: {
                    replaceNewLines: 42
                }
            });
        }).toThrowError(`Property 'options.content.replaceNewLines' must be false or a string`);
    });

    test('options.content.replaceNewLines: true', () => {
        expect(() => {
            (<any>HtmlExtractors.elementContent)('[translate]', {
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
