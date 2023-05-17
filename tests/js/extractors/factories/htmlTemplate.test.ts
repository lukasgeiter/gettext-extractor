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

    test('HTML inside a template literal', () => {
      jsParser.parseString(`
      #
      #
      #
      #
      #
      #
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
          references: ['test:9'],
        },
        {
          text: 'Second level',
          references: ['test:11'],
        },
        {
          text: 'Third level',
          references: ['test:12'],
        },
      ])
    })
  })
})