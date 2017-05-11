import * as ts from 'typescript';

import { JsParser } from '../../src/js/parser';
import { registerCommonParserTests } from '../parser.common';
import { UnicodeSamples } from '../fixtures/unicode';
import { CatalogBuilder } from '../../src/builder';

describe('JsParser', () => {

    registerCommonParserTests(JsParser);

    describe('line number', () => {

        let parser: JsParser;
        let builderMock: CatalogBuilder;

        beforeEach(() => {
            builderMock = <any>{
                addMessage: jest.fn()
            };
            parser = new JsParser(builderMock, [(node: ts.Node, sourceFile: ts.SourceFile, addMessage) => {
                if (node.kind === ts.SyntaxKind.StringLiteral) {
                    addMessage({
                        text: (<ts.StringLiteral>node).text
                    });
                }
            }]);
        });

        test('first line', () => {
            parser.parseString(`'Foo'`, 'foo.html');

            expect(builderMock.addMessage).toHaveBeenCalledWith({
                text: 'Foo',
                references: ['foo.html:1']
            });
        });

        test('third line', () => {
            parser.parseString(`\n\n'Foo'`, 'foo.html');

            expect(builderMock.addMessage).toHaveBeenCalledWith({
                text: 'Foo',
                references: ['foo.html:3']
            });
        });

        test('with offset', () => {
            parser.parseString(`'Foo'`, 'foo.html', {
                lineNumberStart: 10
            });

            expect(builderMock.addMessage).toHaveBeenCalledWith({
                text: 'Foo',
                references: ['foo.html:10']
            });
        });
    });

    describe('unicode', () => {

        function check(text: string): void {
            let parser = new JsParser(new CatalogBuilder(), [(node: ts.StringLiteral) => {
                if (node.kind === ts.SyntaxKind.StringLiteral) {
                    expect(node.text).toEqual(text);
                }
            }]);

            parser.parseString(`"${text}"`);
        }

        test('danish', () => {
            check(UnicodeSamples.danish);
        });

        test('german', () => {
            check(UnicodeSamples.german);
        });

        test('greek', () => {
            check(UnicodeSamples.greek);
        });

        test('english', () => {
            check(UnicodeSamples.english);
        });

        test('spanish', () => {
            check(UnicodeSamples.spanish);
        });

        test('french', () => {
            check(UnicodeSamples.french);
        });

        test('irish gaelic', () => {
            check(UnicodeSamples.irishGaelic);
        });

        test('hungarian', () => {
            check(UnicodeSamples.hungarian);
        });

        test('icelandic', () => {
            check(UnicodeSamples.icelandic);
        });

        test('japanese', () => {
            check(UnicodeSamples.japanese);
        });

        test('hebrew', () => {
            check(UnicodeSamples.hebrew);
        });

        test('polish', () => {
            check(UnicodeSamples.polish);
        });

        test('russian', () => {
            check(UnicodeSamples.russian);
        });

        test('thai', () => {
            check(UnicodeSamples.thai);
        });

        test('turkish', () => {
            check(UnicodeSamples.turkish);
        });
    });
});
