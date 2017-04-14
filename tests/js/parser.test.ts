import * as ts from 'typescript';

import { JsParser } from '../../src/js/parser';
import { registerCommonParserTests } from '../parser.common';
import { UnicodeSamples } from '../fixtures/unicode';
import { CatalogBuilder } from '../../src/builder';

describe('JsParser', () => {

    registerCommonParserTests(JsParser);

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
