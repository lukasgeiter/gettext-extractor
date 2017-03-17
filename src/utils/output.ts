import { IGettextExtractorStats } from '../extractor';

let chalk;
try {
    chalk = require('chalk');
} catch (e) { /* falls back to default colored output */ }

export abstract class OutputUtils {
    public static green(value: string): string {
        return chalk ? chalk.green(value) : value;
    }

    public static grey(value: string): string {
        return chalk ? chalk.grey(value) : value;
    }
}

interface IStatsDetail {
    primaryNumber: number;
    primaryText: string;
    secondaryText?: string;
}

export class StatsOutput {

    private static readonly INDENTATION: number = 2;

    private maxNumberLength: number;
    private maxTextLength: number;

    private get details(): IStatsDetail[] {
        return [
            {
                primaryNumber: this.stats.numberOfMessageUsages,
                primaryText: this.stats.numberOfMessageUsages === 1 ? 'total usage' : 'total usages'
            },
            {
                primaryNumber: this.stats.numberOfParsedFiles,
                primaryText: this.stats.numberOfParsedFiles === 1 ? 'file' : 'files',
                secondaryText: `(${this.stats.numberOfParsedFilesWithMessages} with messages)`
            },
            {
                primaryNumber: this.stats.numberOfContexts,
                primaryText: this.stats.numberOfContexts === 1 ? 'message context' : 'message contexts',
                secondaryText: this.stats.numberOfContexts === 1 && '(default)'
            }
        ];
    }

    private get title(): string {
        return this.stats.numberOfMessages === 1
            ? `${this.padNumber(1)} message extracted`
            : `${this.padNumber(this.stats.numberOfMessages)} messages extracted`;
    }

    constructor(
        private stats: IGettextExtractorStats
    ) {
        let numbers = this.details
            .map(d => d.primaryNumber)
            .concat(this.stats.numberOfMessages);

        this.maxNumberLength = Math.max.apply(undefined, numbers.map(n => n.toString().length));

        this.maxTextLength = Math.max.apply(undefined, this.details.map(l => {
            return this.padNumber(1).length + 1 + l.primaryText.length + (l.secondaryText ? l.secondaryText.length + 1 : 0);
        }).concat(this.title.length));
    }

    public print(): void {
        console.log();
        console.log(this.indent(OutputUtils.green(this.title)));
        console.log(this.indent(OutputUtils.grey(new Array(this.maxTextLength + 2).join('-'))));

        for (let line of this.details) {
            let text = this.padNumber(line.primaryNumber) + ' ' + line.primaryText;
            if (line.secondaryText) {
                text += ' ' + OutputUtils.grey(line.secondaryText);
            }
            console.log(this.indent(text));
        }

        console.log();
    }

    private padNumber(value: number): string {
        return (new Array(this.maxNumberLength).join(' ') + value).slice(-this.maxNumberLength);
    }

    private indent(value: string): string {
        return new Array(StatsOutput.INDENTATION + 1).join(' ') + value;
    }
}
