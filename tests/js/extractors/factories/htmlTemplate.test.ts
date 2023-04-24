import { DefaultTreeTextNode } from 'parse5';

import { htmlTemplateExtractor } from '../../../../src/js/extractors/factories/htmlTemplate'
import { JsExtractors } from '../../../../src/js/extractors';
import { JsParser } from '../../../../src/js/parser';
import { HtmlParser } from '../../../../src/html/parser';
import { CatalogBuilder, IMessage } from '../../../../src/builder';

describe('JS: HTML template extractor', () => {
  describe('calling html parser ', () => {
    let builder: CatalogBuilder;
    let messages: IMessage[]
    let outerJsParser: JsParser;
    let innerJsParser: JsParser;
    let htmlParser: HtmlParser;

    beforeEach(() => {
      messages = [];

      builder = <any>{
        addMessage: jest.fn((message: IMessage) => {
          messages.push(message);
        })
      };

      innerJsParser = new JsParser(builder, [
        JsExtractors.callExpression('service.getText', { arguments: { text: 0, context: 1 } })
      ]);

      htmlParser = new HtmlParser(builder, [
        (node, fileName, addMessage) => {
          if (node.nodeName === '#text') {
            const textNode = node as DefaultTreeTextNode;
            innerJsParser.parseString(textNode.value, fileName, { lineNumberStart: textNode.sourceCodeLocation?.startLine });
          }
        }
      ]);

      outerJsParser = new JsParser(builder, [
        htmlTemplateExtractor(htmlParser)
      ]);
    });

    test('HTML inside a template literal', () => {
      outerJsParser.parseString(`let tuce = \`
          <div>
              {{ service.getText('First level') }}
              <div>
                  {{ service.getText('Second level') }}
                  <div> {{ service.getText('Third level') }} </div>
              </div>
          </div>\`
      `)

      expect(messages).toEqual([
        {
          text: 'First level'
        },
        {
          text: 'Second level'
        },
        {
          text: 'Third level'
        },
      ])
    })

  })
})