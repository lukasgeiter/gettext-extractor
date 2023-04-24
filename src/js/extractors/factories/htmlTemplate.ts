import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../../js/parser';
import { Validate } from '../../../utils/validate';
import { HtmlParser } from '../../../html/parser';

export function htmlTemplateExtractor(htmlParser: HtmlParser): IJsExtractorFunction {
  Validate.required.argument({ htmlParser });

  return (node: ts.Node, sourceFile: ts.SourceFile) => {
    if (node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
      const source = node.getText(sourceFile);
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart());

      htmlParser.parseString(source, sourceFile.fileName, { lineNumberStart: lineNumber.line });
    }
  };
}
