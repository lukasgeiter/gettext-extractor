import * as parse5 from 'parse5';
import { HtmlUtils, IElementContentOptions } from '../../src/html/utils';
import { Element } from '../../src/html/parser';

describe('HTML: Utils', () => {

    function createElement(source: string): Element {
        return <Element>(<any>parse5.parse(source)).childNodes[0].childNodes[1].childNodes[0];
    }

    describe('getAttributeValue', () => {

        test('normal attribute value', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo="bar"/>'), 'foo')).toBe('bar');
        });

        test('attribute missing', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p/>'), 'foo')).toBe(null);
        });

        test('empty string', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo=""/>'), 'foo')).toBe('');
        });

        test('no value', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo/>'), 'foo')).toBe('');
        });

        test('"null"', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo="null"/>'), 'foo')).toBe('null');
        });

        test('numeric', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo="42"/>'), 'foo')).toBe('42');
        });
    });

    function registerGetElementContentTests(newLine: string): void {
        const SINGLE_LINE = `<p>FooBar</p>`;
        const SINGLE_LINE_WITH_ELEMENT = `<p>Foo<strong>Bar</strong></p>`;
        const SINGLE_LINE_ON_SEPARATE_LINE = `<p>${newLine}FooBar${newLine}</p>`;
        const SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_SPACES = `<p>${newLine}    FooBar${newLine}</p>`;
        const SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_TABS = `<p>${newLine}\tFooBar${newLine}</p>`;
        const SINGLE_LINE_WITH_MULTIPLE_LEADING_NEWLINES = `<p>${newLine}${newLine}FooBar</p>`;
        const SINGLE_LINE_WITH_MULTIPLE_TRAILING_NEWLINES = `<p>FooBar${newLine}${newLine}</p>`;

        const MULTIPLE_LINES = `<p>${newLine}Foo${newLine}Bar${newLine}</p>`;
        const MULTIPLE_LINES_INDENTED_SPACES = `<p>${newLine}    Foo${newLine}    Bar${newLine}</p>`;
        const MULTIPLE_LINES_INDENTED_TABS = `<p>${newLine}\tFoo${newLine}\tBar${newLine}</p>`;

        const MULTIPLE_CHILD_ELEMENTS = `<div>${newLine}<div>${newLine}<p>Foo</p>${newLine}<p>Bar</p>${newLine}</div>${newLine}</div>`;
        const MULTIPLE_CHILD_ELEMENTS_INDENTED_SPACES = `<div>${newLine}    <div>${newLine}        <p>Foo</p>${newLine}        <p>Bar</p>${newLine}    </div>${newLine}</div>`;
        const MULTIPLE_CHILD_ELEMENTS_INDENTED_TABS = `<div>${newLine}\t<div>${newLine}\t\t<p>Foo</p>${newLine}\t\t<p>Bar</p>${newLine}\t</div>${newLine}</div>`;

        let options: IElementContentOptions;

        function getContent(source: string): string {
            return HtmlUtils.getElementContent(createElement(source), options);
        }

        describe('normal', () => {

            beforeEach(() => {
                options = {
                    preserveIndentation: false,
                    replaceNewLines: false,
                    trimWhiteSpace: true
                };
            });

            test('single line of text', () => {
                expect(getContent(SINGLE_LINE)).toBe('FooBar');
            });

            test('single line of text with element', () => {
                expect(getContent(SINGLE_LINE_WITH_ELEMENT)).toBe('Foo<strong>Bar</strong>');
            });

            test('single line of text on separate line', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE)).toBe('FooBar');
            });

            test('single line of text on separate line indented with spaces', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_SPACES)).toBe('FooBar');
            });

            test('single line of text on separate line indented with tabs', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_TABS)).toBe('FooBar');
            });

            test('single line of text with multiple leading newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_LEADING_NEWLINES)).toBe('FooBar');
            });

            test('single line of text with multiple trailing newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_TRAILING_NEWLINES)).toBe('FooBar');
            });

            test('multiple lines of text', () => {
                expect(getContent(MULTIPLE_LINES)).toBe('Foo\nBar');
            });

            test('multiple lines of text indented with spaces', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_SPACES)).toBe('Foo\nBar');
            });

            test('multiple lines of text indented with tabs', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_TABS)).toBe('Foo\nBar');
            });

            test('multiple child elements', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS)).toBe('<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>');
            });

            test('multiple child elements indented with spaces', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_SPACES)).toBe('<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>');
            });

            test('multiple child elements indented with tabs', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_TABS)).toBe('<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>');
            });
        });

        describe('don\'t trim whitespace', () => {

            beforeEach(() => {
                options = {
                    preserveIndentation: false,
                    replaceNewLines: false,
                    trimWhiteSpace: false
                };
            });

            test('single line of text', () => {
                expect(getContent(SINGLE_LINE)).toBe('FooBar');
            });

            test('single line of text with element', () => {
                expect(getContent(SINGLE_LINE_WITH_ELEMENT)).toBe('Foo<strong>Bar</strong>');
            });

            test('single line of text on separate line', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE)).toBe('\nFooBar\n');
            });

            test('single line of text on separate line indented with spaces', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_SPACES)).toBe('\nFooBar\n');
            });

            test('single line of text on separate line indented with tabs', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_TABS)).toBe('\nFooBar\n');
            });

            test('single line of text with multiple leading newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_LEADING_NEWLINES)).toBe('\n\nFooBar');
            });

            test('single line of text with multiple trailing newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_TRAILING_NEWLINES)).toBe('FooBar\n\n');
            });

            test('multiple lines of text', () => {
                expect(getContent(MULTIPLE_LINES)).toBe('\nFoo\nBar\n');
            });

            test('multiple lines of text indented with spaces', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_SPACES)).toBe('\nFoo\nBar\n');
            });

            test('multiple lines of text indented with tabs', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_TABS)).toBe('\nFoo\nBar\n');
            });

            test('multiple child elements', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS)).toBe('\n<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>\n');
            });

            test('multiple child elements indented with spaces', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_SPACES)).toBe('\n<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>\n');
            });

            test('multiple child elements indented with tabs', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_TABS)).toBe('\n<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>\n');
            });
        });

        describe('preserve indentation', () => {

            beforeEach(() => {
                options = {
                    preserveIndentation: true,
                    replaceNewLines: false,
                    trimWhiteSpace: true
                };
            });

            test('single line of text', () => {
                expect(getContent(SINGLE_LINE)).toBe('FooBar');
            });

            test('single line of text with element', () => {
                expect(getContent(SINGLE_LINE_WITH_ELEMENT)).toBe('Foo<strong>Bar</strong>');
            });

            test('single line of text on separate line', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE)).toBe('FooBar');
            });

            test('single line of text on separate line indented with spaces', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_SPACES)).toBe('    FooBar');
            });

            test('single line of text on separate line indented with tabs', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_TABS)).toBe('\tFooBar');
            });

            test('single line of text with multiple leading newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_LEADING_NEWLINES)).toBe('FooBar');
            });

            test('single line of text with multiple trailing newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_TRAILING_NEWLINES)).toBe('FooBar');
            });

            test('multiple lines of text', () => {
                expect(getContent(MULTIPLE_LINES)).toBe('Foo\nBar');
            });

            test('multiple lines of text indented with spaces', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_SPACES)).toBe('    Foo\n    Bar');
            });

            test('multiple lines of text indented with tabs', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_TABS)).toBe('\tFoo\n\tBar');
            });

            test('multiple child elements', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS)).toBe('<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>');
            });

            test('multiple child elements indented with spaces', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_SPACES)).toBe('    <div>\n        <p>Foo</p>\n        <p>Bar</p>\n    </div>');
            });

            test('multiple child elements indented with tabs', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_TABS)).toBe('\t<div>\n\t\t<p>Foo</p>\n\t\t<p>Bar</p>\n\t</div>');
            });
        });

        describe('preserve indentation and don\'t trim whitespace', () => {

            beforeEach(() => {
                options = {
                    preserveIndentation: true,
                    replaceNewLines: false,
                    trimWhiteSpace: false
                };
            });

            test('single line of text', () => {
                expect(getContent(SINGLE_LINE)).toBe('FooBar');
            });

            test('single line of text with element', () => {
                expect(getContent(SINGLE_LINE_WITH_ELEMENT)).toBe('Foo<strong>Bar</strong>');
            });

            test('single line of text on separate line', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE)).toBe('\nFooBar\n');
            });

            test('single line of text on separate line indented with spaces', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_SPACES)).toBe('\n    FooBar\n');
            });

            test('single line of text on separate line indented with tabs', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_TABS)).toBe('\n\tFooBar\n');
            });

            test('single line of text with multiple leading newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_LEADING_NEWLINES)).toBe('\n\nFooBar');
            });

            test('single line of text with multiple trailing newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_TRAILING_NEWLINES)).toBe('FooBar\n\n');
            });

            test('multiple lines of text', () => {
                expect(getContent(MULTIPLE_LINES)).toBe('\nFoo\nBar\n');
            });

            test('multiple lines of text indented with spaces', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_SPACES)).toBe('\n    Foo\n    Bar\n');
            });

            test('multiple lines of text indented with tabs', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_TABS)).toBe('\n\tFoo\n\tBar\n');
            });

            test('multiple child elements', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS)).toBe('\n<div>\n<p>Foo</p>\n<p>Bar</p>\n</div>\n');
            });

            test('multiple child elements indented with spaces', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_SPACES)).toBe('\n    <div>\n        <p>Foo</p>\n        <p>Bar</p>\n    </div>\n');
            });

            test('multiple child elements indented with tabs', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_TABS)).toBe('\n\t<div>\n\t\t<p>Foo</p>\n\t\t<p>Bar</p>\n\t</div>\n');
            });
        });

        describe('replace newlines with space', () => {

            beforeEach(() => {
                options = {
                    preserveIndentation: false,
                    replaceNewLines: ' ',
                    trimWhiteSpace: true
                };
            });

            test('single line of text', () => {
                expect(getContent(SINGLE_LINE)).toBe('FooBar');
            });

            test('single line of text with element', () => {
                expect(getContent(SINGLE_LINE_WITH_ELEMENT)).toBe('Foo<strong>Bar</strong>');
            });

            test('single line of text on separate line', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE)).toBe('FooBar');
            });

            test('single line of text on separate line indented with spaces', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_SPACES)).toBe('FooBar');
            });

            test('single line of text on separate line indented with tabs', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_TABS)).toBe('FooBar');
            });

            test('single line of text with multiple leading newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_LEADING_NEWLINES)).toBe('FooBar');
            });

            test('single line of text with multiple trailing newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_TRAILING_NEWLINES)).toBe('FooBar');
            });

            test('multiple lines of text', () => {
                expect(getContent(MULTIPLE_LINES)).toBe('Foo Bar');
            });

            test('multiple lines of text indented with spaces', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_SPACES)).toBe('Foo Bar');
            });

            test('multiple lines of text indented with tabs', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_TABS)).toBe('Foo Bar');
            });

            test('multiple child elements', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS)).toBe('<div> <p>Foo</p> <p>Bar</p> </div>');
            });

            test('multiple child elements indented with spaces', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_SPACES)).toBe('<div> <p>Foo</p> <p>Bar</p> </div>');
            });

            test('multiple child elements indented with tabs', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_TABS)).toBe('<div> <p>Foo</p> <p>Bar</p> </div>');
            });
        });

        describe('replace newlines with space and preserve indentation', () => {

            beforeEach(() => {
                options = {
                    preserveIndentation: true,
                    replaceNewLines: ' ',
                    trimWhiteSpace: true
                };
            });

            test('single line of text', () => {
                expect(getContent(SINGLE_LINE)).toBe('FooBar');
            });

            test('single line of text with element', () => {
                expect(getContent(SINGLE_LINE_WITH_ELEMENT)).toBe('Foo<strong>Bar</strong>');
            });

            test('single line of text on separate line', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE)).toBe('FooBar');
            });

            test('single line of text on separate line indented with spaces', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_SPACES)).toBe('    FooBar');
            });

            test('single line of text on separate line indented with tabs', () => {
                expect(getContent(SINGLE_LINE_ON_SEPARATE_LINE_INDENTED_TABS)).toBe('\tFooBar');
            });

            test('single line of text with multiple leading newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_LEADING_NEWLINES)).toBe('FooBar');
            });

            test('single line of text with multiple trailing newlines', () => {
                expect(getContent(SINGLE_LINE_WITH_MULTIPLE_TRAILING_NEWLINES)).toBe('FooBar');
            });

            test('multiple lines of text', () => {
                expect(getContent(MULTIPLE_LINES)).toBe('Foo Bar');
            });

            test('multiple lines of text indented with spaces', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_SPACES)).toBe('    Foo     Bar');
            });

            test('multiple lines of text indented with tabs', () => {
                expect(getContent(MULTIPLE_LINES_INDENTED_TABS)).toBe('\tFoo \tBar');
            });

            test('multiple child elements', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS)).toBe('<div> <p>Foo</p> <p>Bar</p> </div>');
            });

            test('multiple child elements indented with spaces', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_SPACES)).toBe('    <div>         <p>Foo</p>         <p>Bar</p>     </div>');
            });

            test('multiple child elements indented with tabs', () => {
                expect(getContent(MULTIPLE_CHILD_ELEMENTS_INDENTED_TABS)).toBe('\t<div> \t\t<p>Foo</p> \t\t<p>Bar</p> \t</div>');
            });
        });

        describe('un-escaping', () => {

            test('&', () => {
                expect(getContent('<div>Foo & Bar</div>')).toBe('Foo & Bar');
            });

            test('<', () => {
                expect(getContent('<div>Foo < Bar</div>')).toBe('Foo < Bar');
            });

            test('>', () => {
                expect(getContent('<div>Foo > Bar</div>')).toBe('Foo > Bar');
            });
        });
    }

    describe('getElementContent', () => {

        registerGetElementContentTests('\n');
    });

    describe('getElementContent CRLF', () => {

        registerGetElementContentTests('\r\n');
    });
});
