"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsOutput = exports.OutputUtils = void 0;
let chalk;
try {
    chalk = require('chalk');
}
catch (e) { /* falls back to default colored output */ }
class OutputUtils {
    static green(value) {
        return chalk ? chalk.green(value) : value;
    }
    static grey(value) {
        return chalk ? chalk.grey(value) : value;
    }
}
exports.OutputUtils = OutputUtils;
class StatsOutput {
    constructor(stats) {
        this.stats = stats;
        let numbers = this.details
            .map(d => d.primaryNumber)
            .concat(this.stats.numberOfMessages);
        this.maxNumberLength = Math.max.apply(undefined, numbers.map(n => n.toString().length));
        this.maxTextLength = Math.max.apply(undefined, this.details.map(l => {
            return this.padNumber(1).length + 1 + l.primaryText.length + (l.secondaryText ? l.secondaryText.length + 1 : 0);
        }).concat(this.title.length));
    }
    get details() {
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
    get title() {
        return this.stats.numberOfMessages === 1
            ? `${this.padNumber(1)} message extracted`
            : `${this.padNumber(this.stats.numberOfMessages)} messages extracted`;
    }
    print() {
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
    padNumber(value) {
        return (new Array(this.maxNumberLength).join(' ') + value).slice(-this.maxNumberLength);
    }
    indent(value) {
        return new Array(StatsOutput.INDENTATION + 1).join(' ') + value;
    }
}
exports.StatsOutput = StatsOutput;
StatsOutput.INDENTATION = 2;
