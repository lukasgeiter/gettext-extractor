import { ICommentOptions } from './comments';
import { IContentExtractorOptions } from '../../utils/content';
export interface IArgumentIndexMapping {
    text: number;
    textPlural?: number;
    context?: number;
}
export interface IJsExtractorOptions extends IContentExtractorOptions {
    arguments: IArgumentIndexMapping;
    comments?: ICommentOptions;
}
export declare function validateOptions(options: IJsExtractorOptions): void;
