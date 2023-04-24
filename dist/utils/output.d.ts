import { IGettextExtractorStats } from '../extractor';
export declare abstract class OutputUtils {
    static green(value: string): string;
    static grey(value: string): string;
}
export declare class StatsOutput {
    private stats;
    private static readonly INDENTATION;
    private maxNumberLength;
    private maxTextLength;
    private get details();
    private get title();
    constructor(stats: IGettextExtractorStats);
    print(): void;
    private padNumber;
    private indent;
}
