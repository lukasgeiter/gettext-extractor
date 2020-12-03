import { RegexParser } from '../../../../src/regex/parser';
import { CatalogBuilder, IMessage } from '../../../../src/builder';
import { addConditionExtractor } from '../../../../src/regex/extractors/factories/addCondition';

describe('HTML: Element Attribute Extractor', () => {

    let builder: CatalogBuilder,
        messages: IMessage[],
        parser: RegexParser;

    beforeEach(() => {
        messages = [];

        builder = <any>{
            addMessage: jest.fn((message: IMessage) => {
                messages.push(message);
            })
        };
    });

    describe('standard', () => {

        beforeEach(() => {
            parser = new RegexParser(builder, [
                addConditionExtractor({
                    regex: /\[Translate\:\s?(.*?)\s?(\|\s?(.*))?\]/is,
                    text: 1,
                    textPlural: 3
                })
            ]);
        });

        test('just singular text', () => {
            parser.parseString(`This is some text containing [Translate: a translatable string] that should be translated`);
            expect(messages).toEqual([{
                comments: [],
                references: ["gettext-extractor-string-literal:1"],
                text: "a translatable string",
                textPlural: undefined
            }]);
        });

        test('just plural text', () => {
            parser.parseString(`This is some text containing [Translate: a translatable string | some translatable strings] that should be translated`);
            expect(messages).toEqual([{
                comments: [],
                references: ["gettext-extractor-string-literal:1"],
                text: "a translatable string",
                textPlural: "some translatable strings"
            }]);
        });

        test('just multiline text', () => {
            parser.parseString(
                `This is some text containing a [Translate: Translatable
                multiline
                text]`
            );

            expect(messages).toEqual([{
                comments: [],
                references: ["gettext-extractor-string-literal:1"],
                text: `Translatable
                multiline
                text`,
                textPlural: undefined
            }]);
        });
    });

    describe('argument validation', () => {

        test('arguments[0]: none', () => {
            expect(() => {
                (<any>addConditionExtractor)();
            }).toThrowError(/Cannot destructure property `(.*)` of 'undefined' or 'null'/);
        });

        test('arguments[0]: wrong type', () => {
            expect(() => {
                (<any>addConditionExtractor)('test');
            }).toThrowError(/Missing argument (.*)/);
        });

        test('arguments[0].regex: Missing', () => {
            expect(() => {
                (<any>addConditionExtractor)({
                    text: 1
                });
            }).toThrowError('Missing argument \'regex\'');
        });

        test('arguments[0].regex: Wrong type', () => {
            expect(() => {
                (<any>addConditionExtractor)({
                    regex: 'test',
                    text: 1
                });
            }).toThrowError(/Property 'arguments\[0\].regex' must be a regular expression/);
        });

        test('arguments[0].text: Missing', () => {
            expect(() => {
                (<any>addConditionExtractor)({
                    regex: /(.*)/
                });
            }).toThrowError('Missing argument \'text\'');
        });


        test('arguments[0].text: Wrong type', () => {
            expect(() => {
                (<any>addConditionExtractor)({
                    regex: /(.*)/,
                    text: 'test'
                });
            }).toThrowError(/Property 'arguments\[0\].text' must be a number/);
        });

        test('arguments[0].textPlural: Wrong type', () => {
            expect(() => {
                (<any>addConditionExtractor)({
                    regex: /(.*)/,
                    text: 1,
                    textPlural: 'test'
                });
            }).toThrowError(/Property 'arguments\[0\].textPlural' must be a number/);
        });
    });
});
