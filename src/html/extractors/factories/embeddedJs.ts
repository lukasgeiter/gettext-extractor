import { JsParser } from '../../../js/parser';
import { IHtmlExtractorFunction, Element, Node } from '../../parser';
import { ElementSelectorSet } from '../../selector';
import { HtmlUtils } from '../../utils';
import { Validate } from '../../../utils/validate';

export function embeddedJsExtractor(selector: string, jsParser: JsParser): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({selector});
    Validate.required.argument({jsParser});

    let selectors = new ElementSelectorSet(selector);

    return (node: Node, fileName: string) => {
        if (typeof (<Element>node).tagName !== 'string') {
            return;
        }

        let element = <Element>node;

        if (selectors.anyMatch(element)) {
            let source = HtmlUtils.getElementContent(element, {
                trimWhiteSpace: false,
                preserveIndentation: true,
                replaceNewLines: false
            });
            jsParser.parseString(source, fileName, {
                lineNumberStart: element.__location && element.__location.line
            });
        }
    };
}
