import { IRegexExtractorFunction } from '../../parser';
import { RegexUtils } from '../../utils';
import { IMessage } from '../../../builder';
import { Validate } from '../../../utils/validate';

type IAddConditionExtractorArgument = {
    regex: RegExp,
    text: number,
    textPlural?: number
};

export function addConditionExtractor({ regex, text, textPlural }: IAddConditionExtractorArgument): IRegexExtractorFunction {

    Validate.required.argument({ regex });
    Validate.required.argument({ text });
    Validate.required.regexProperty({ regex }, 'arguments[0].regex');
    Validate.required.numberProperty({ text }, 'arguments[0].text');
    Validate.optional.numberProperty({ textPlural }, 'arguments[0].textPlural');

    return (sourceFileContent:string, sourceFilePath:string, messages:Array<IMessage>) => {

        // Check if the flags have a global flag
        if (regex.flags.indexOf('g') === -1) {
            // If not, add it.
            regex = new RegExp(regex.source, regex.flags + 'g');
        }

        // Check if the flags have a multiline flag
        if (regex.flags.indexOf('m') === -1) {
            // If not, add it.
            regex = new RegExp(regex.source, regex.flags + 'm');
        }

        const matches = sourceFileContent.match(regex);

        if (matches !== null) {
            for (let match of matches) {

                const matchGroups = regex.exec(match);

                if (matchGroups !== null) {

                    const message: IMessage = {
                        text: matchGroups[text],
                        references: [`${sourceFilePath}:${RegexUtils.getLineNumber(sourceFileContent, match)}`],
                        comments: []
                    };

                    if (textPlural) {
                        message.textPlural = matchGroups[textPlural];
                    }

                    messages.push(message);
                }

                // Reset last index for next string
                regex.lastIndex = 0;
            }
        }
    }
}