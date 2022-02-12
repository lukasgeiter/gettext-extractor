# Gettext Extractor [![Tests Status][status-tests-badge]][status-tests-link]

*A flexible and powerful Gettext message extractor with support for JavaScript, TypeScript, JSX and HTML*

It works by running your files through a parser and then uses the AST (Abstract Syntax Tree) to find and extract translatable strings from your source code. All extracted strings can then be saved as `.pot` file to act as template for translation files.

Unlike many of the alternatives, this library is highly configurable and is designed to work with most existing setups.

For the full documentation check out the [Github Wiki][wiki].

</br>

## Installation

> **Note:** This package requires Node.js version 6 or higher.

#### Yarn

```text
yarn add gettext-extractor
```

#### NPM

```text
npm install gettext-extractor
```

</br>

## Getting Started

Let's start with a code example:

```javascript
const { GettextExtractor, JsExtractors, HtmlExtractors } = require('gettext-extractor');

let extractor = new GettextExtractor();

extractor
    .createJsParser([
        JsExtractors.callExpression('getText', {
            arguments: {
                text: 0,
                context: 1
            }
        }),
        JsExtractors.callExpression('getPlural', {
            arguments: {
                text: 1,
                textPlural: 2,
                context: 3
            }
        })
    ])
    .parseFilesGlob('./src/**/*.@(ts|js|tsx|jsx)');

extractor
    .createHtmlParser([
        HtmlExtractors.elementContent('translate, [translate]')
    ])
    .parseFilesGlob('./src/**/*.html');

extractor.savePotFile('./messages.pot');

extractor.printStats();
```

A detailed explanation of this code example and much more can be found in the [Github Wiki][wiki-introduction].

<br/>

## Contributing

From reporting a bug to submitting a pull request: every contribution is appreciated and welcome.
Report bugs, ask questions and request features using [Github issues][github-issues].
If you want to contribute to the code of this project, please read the [Contribution Guidelines][contributing].

[status-tests-badge]: https://github.com/lukasgeiter/gettext-extractor/actions/workflows/tests.yml/badge.svg
[status-tests-link]: https://github.com/lukasgeiter/gettext-extractor/actions/workflows/tests.yml
[wiki]: https://github.com/lukasgeiter/gettext-extractor/wiki
[wiki-introduction]: https://github.com/lukasgeiter/gettext-extractor/wiki/Introduction
[github-issues]: https://github.com/lukasgeiter/gettext-extractor/issues
[contributing]: CONTRIBUTING.md
