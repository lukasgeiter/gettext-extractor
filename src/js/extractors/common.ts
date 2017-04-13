import { Validate } from '../../utils/validate';
import { ICommentOptions } from './comments';

export interface IArgumentIndexMapping {
    text: number;
    textPlural?: number;
    context?: number;
}

export interface IJsExtractorOptions {
    arguments: IArgumentIndexMapping;
    comments?: ICommentOptions;
}

export function validateOptions(options: IJsExtractorOptions): void {
    Validate.required.numberProperty(options, 'options.arguments.text');
    Validate.optional.numberProperty(options, 'options.arguments.textPlural');
    Validate.optional.numberProperty(options, 'options.arguments.context');
    Validate.optional.regexProperty(options, 'options.comments.regex');
    Validate.optional.booleanProperty(options, 'options.comments.otherLineLeading');
    Validate.optional.booleanProperty(options, 'options.comments.sameLineLeading');
    Validate.optional.booleanProperty(options, 'options.comments.sameLineTrailing');
}
