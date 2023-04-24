import { IHtmlExtractorFunction } from '../../parser';
import { IElementSelector } from '../../selector';
import { Element } from '../../parser';
import { IHtmlExtractorOptions } from '../common';
export declare type ITextExtractor = (element: Element) => string | null;
export declare function elementExtractor(selector: string | IElementSelector[], textExtractor: ITextExtractor, options?: IHtmlExtractorOptions): IHtmlExtractorFunction;
