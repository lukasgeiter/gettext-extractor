import { JsParser } from '../../src/js/parser';
import { registerCommonParserTests } from '../parser.common';

describe('JsParser', () => {

    registerCommonParserTests(JsParser);
});
