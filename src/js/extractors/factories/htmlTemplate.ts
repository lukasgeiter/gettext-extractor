import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../../js/parser';
import { Validate } from '../../../utils/validate';
import { HtmlParser } from '../../../html/parser';

export function htmlTemplateExtractor(htmlParser: HtmlParser): IJsExtractorFunction {
  Validate.required.argument({ htmlParser });

  return (node: ts.Node, sourceFile: ts.SourceFile, _, lineNumberStart = 1) => {
    if (ts.isStringLiteralLike(node)) {
      const source = node.getText(sourceFile);
      const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));

      htmlParser.parseString(
        source,
        sourceFile.fileName,
        { lineNumberStart: lineNumberStart + location.line }
      );
    }
  };
}
