import { htmlTemplateExtractor } from '../../../../src/js/extractors/factories/htmlTemplate'
import { HtmlExtractors } from '../../../../src/html/extractors';
import { JsParser } from '../../../../src/js/parser';
import { HtmlParser } from '../../../../src/html/parser';
import { CatalogBuilder, IMessage } from '../../../../src/builder';

describe('JS: HTML template extractor', () => {
  describe('calling html parser ', () => {
    let builder: CatalogBuilder;
    let messages: IMessage[]
    let jsParser: JsParser;
    let htmlParser: HtmlParser;

    beforeEach(() => {
      messages = [];

      builder = <any>{
        addMessage: jest.fn((message: IMessage) => {
          messages.push(message);
        })
      };

      htmlParser = new HtmlParser(builder, [
        HtmlExtractors.elementContent('translate')
      ]);

      jsParser = new JsParser(builder, [
        htmlTemplateExtractor(htmlParser)
      ]);
    });

    test('single line (regular string)', () => {
      jsParser.parseString("let itBe = \"<div> <translate> test </translate> </div>\"");
      expect(messages).toEqual([
        {
          text: 'test'
        }
      ])
    });

    test('single line (template string)', () => {
      jsParser.parseString("let itBe = \"<div> <translate> test </translate> </div>\"");
      expect(messages).toEqual([
        {
          text: 'test'
        }
      ])
    });

    test('with lineNumberStart option (regular string)', () => {
      jsParser.parseString(
        "let itBe = \"<div> <translate> test </translate> </div>\"",
        'test',
        { lineNumberStart: 10 }
      );

      expect(messages).toEqual([
        {
          text: 'test',
          references: ['test:10'],
        },
      ])
    })

    test('with lineNumberStart option (template string)', () => {
      jsParser.parseString(
        `let itBe = \"<div> <translate> test </translate> </div>\"`,
        'test',
        { lineNumberStart: 10 }
      );

      expect(messages).toEqual([
        {
          text: 'test',
          references: ['test:10'],
        },
      ])
    })

    test('HTML inside a template literal with the correct line numbers', () => {
      jsParser.parseString(`
       
       
       
       
       
       
      let tuce = \`
          <div>
              <translate> First level </translate>
              <div>
                  <translate> Second level </translate>
                  <div> <translate> Third level </translate> </div>
              </div>
          </div>\`
      `, 'test')

      expect(messages).toEqual([
        {
          text: 'First level',
          references: ['test:10'],
        },
        {
          text: 'Second level',
          references: ['test:12'],
        },
        {
          text: 'Third level',
          references: ['test:13'],
        },
      ])
    })

    test('HTML inside a template literal with correct line numbers and with lineNumberStart', () => {
      jsParser.parseString(`






      let tuce = \`
          <div>
              <translate> First level </translate>
              <div>
                  <translate> Second level </translate>
                  <div> <translate> Third level </translate> </div>
              </div>
          </div>\`
      `, 'test', { lineNumberStart: 10 })

      expect(messages).toEqual([
        {
          text: 'First level',
          references: ['test:19'],
        },
        {
          text: 'Second level',
          references: ['test:21'],
        },
        {
          text: 'Third level',
          references: ['test:22'],
        },
      ])
    })
  })
})