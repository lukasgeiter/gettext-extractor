# Gettext Extractor [![Build Status][travis-status]][travis-link]

*A flexible and powerful Gettext message extractor with support for JavaScript, TypeScript and JSX.*

It works by running your files through a parser and then uses the AST (Abstract Syntax Tree) to find and extract translatable strings from your source code. All extracted strings can then be saved as `.pot` file to act as template for translation files.

Unlike many of the alternatives, this library is highly configurable and is designed to work with most existing setups. 

</br>


## Installation

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
const { GettextExtractor, JsExtractors } = require('gettext-extractor');

// create extractor instance
let extractor = new GettextExtractor();

extractor
    // create a parser for JavaScript or TypeScript and configure extractor functions
    .createJsParser([
        // extract getText('Foo', 'Context')
        JsExtractors.functionCall('getText', {
            // specify which function arguments should be extracted
            arguments: {
                text: 0,
                context: 1 
            }
        }),
        // extract getPlural(count, 'Foo', 'Foos', 'Context')
        JsExtractors.functionCall('getPlural', {
            // specify which function arguments should be extracted
            arguments: {
                text: 1,
                textPlural: 2,
                context: 3
            }
        })
    ])
    // parse all .ts, .js, .tsx and .jsx files in src
    .parseFilesGlob('./src/**/*.@(ts|js|tsx|jsx)');

// save the extracted messages as Gettext template file
extractor.savePotFile('./messages.pot');

// or save the extracted messages asynchronously
extractor.savePotFileAsync('./messages.pot')
    .then(() => console.log('Done'))
    .catch((err) => console.error(err.message));

// print nice statistics about the extracted messages
extractor.printStats();
```

#### Import

First of all we have to import this package. Unfortunately ES6 modules aren't supported by node.js yet, but we can use deconstruction to the two imports we need. Of course doing `var lib = require('gettext-extractor');` works as well.

> **Note:** If you use an ES6 transpiler you can of course go for the nicer syntax:
```javascript
import { GettextExtract, JsExtractors } from 'gettext-extractor';
```

#### Extractor Instance

To get started we create a `GettextExtractor` instance. This object gathers extracted messages and in the end saves them as template for other languages.
You may create multiple instances, which can be useful if you want to separate your strings into multiple `.pot` files.

> **Note:** Extracted strings are called *messages* in Gettext terminology. (sometimes incorrectly referred to as *translations*)

#### Creating a Parser

Now we create a JavaScript parser using `createJsParser` and pass in two extractor functions, created via the factory `JsExtractors.functionCall`. These functions are responsible for extracting messages from your code.  
For more information, read the [Extractor Functions](#extractor-functions) section. The [API Reference](#jsextractors) can be helpful as well.

> **Note:** The term *"JavaScript"* (or short *"JS"*) in the context of this documentation refers to TypeScript and JSX as well.

#### Parsing Files

All the configuration is done and we can get started with parsing. The method `parseFilesGlob` let's us pass in a [glob pattern][node-glob-primer] and runs all files that match through the parser to extract messages. There are other methods for parsing a single file or just a string as well. All of them are documented in the [API Reference](#parser).

#### Saving as Template File

With `savePotFile()` or `savePotFileAsync()` all extracted messages are written to the specified `.pot` file in Gettext format.

#### Printing Statistics

And finally, `printStats()` writes statistics about all extracted messages to the console. Read more in [Statistics](#statistics).

</br>


## Extractor Functions

Extractor functions are just regular functions that are responsible for finding and extracting translatable strings.  
They run for every node in the AST and add strings they find to the message catalog.

If this sounds complicated to you, don't worry! In most cases you don't actually have to write an extractor function yourself.
This library includes factories to create extractor functions, but still allow you a lot of control over what they extract.

#### Function Calls

This is the factory that we also used in the [Getting Started](#getting-started) example. It can be used for all call expressions that do not call a method on an object. For example:

```javascript
getText('Foo');
```

And here's how the factory is used:

```javascript
JsExtractors.functionCall('getText', {
    arguments: {
        text: 0,
        context: 1
    },
    comments: {
        extractSameTrailing: true
    }
});
```

##### Options

Since both factories take the same `arguments` and `comments` options. They are explained [below](#arguments). 

#### Method Calls

A function is considered a *method* if it is called **on** an object. Like this:

```javascript
translations.getText('Foo');
```
And here's how the factory is used:

```javascript
JsExtractors.methodCall('translations', 'getText', {
    arguments: {
        text: 0,
        context: 1
    },
    comments: {
        extractSameTrailing: true
    },
    ignoreMemberInstance: true
});
```

##### Options

For this factory there is one more option in addition to `arguments` and `comments`, which are explained [below](#arguments).
`ignoreMemberInstance` will ignore all `this.*` expressions if set to `true`. That means this would **not** get extracted:

```javascript
this.translations.getText('Foo');
```

#### Arguments

Both extractors factories require you to specify which function arguments they should extract. There are three different pieces of message information that can be extracted and for each of them you can specify the position (starting with zero) of the corresponding argument: 

- `text`
- `textPlural`
- `context`

`text` is required in any case, the others are optional.

###### Example

If your calls look like this:

```javascript
getPlural(count, 'Foo', 'Foos', 'Context');
```

Your `arguments` object would look like this:

```javascript
{
    text: 1,
    textPlural: 2,
    context: 3
}
```

> **Note:** Any additional arguments like `count` in the above example, will just be ignored as long as their position isn't assigned to any of the extracted arguments.

#### Comments

Both extractor functions also pull JavaScript comments from your code and add them to the Gettext catalog as extracted comments (`#. comment`).
This goes for `// single line` as well as `/* block */` comments.

> **Note:** Block comments that span multiple lines are not supported.

By default all comments on the same line (before or after) of the call expression are extracted. You can change this configuration by adding a `comments` object to the `options` you pass in.
All available settings are listed in the [API Reference](#comment-options).

</br>


## Statistics

If you're using this library in a CLI context, you might want to print some statistics after you're done.  
`extractor.printStats()` will do all the work for you (using `console.log`).

> **Note:** if you want the output to be colored, make sure you have installed [chalk]. It's not included in this package's dependencies since it isn't required for any of the functionality, but it's very likely that a different package already installed it in your project.

This is what the stats look like:

```text
   6 messages extracted
  ---------------------------------
   7 total usages
  10 files (3 with messages)
   1 message context (default)
```

If you would rather get the raw numbers, use `extractor.getStats()`. Take a look at the [API Reference](#getstats) for more details.

</br>


## API Reference

*Public API of the Gettext Extractor library.*

> **Note:** For TypeScript users, .d.ts files are included in the node module, for auto-completion and documentation.

### GettextExtractor


#### `createJsParser([extractors])`

*Creates a parser for JavaScript, TypeScript and JSX files.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `extractors` | *array* | [Extractor Functions](#extractor-functions) which will be used with this parser. They can also be added to the parser later, by using `addExtractor`. |

##### Return Value

*[Parser](#parser)*

---


#### `addMessage(message)`

*Manually add a message to the extracted messages.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `message` | *object* | Message data |
| →&nbsp;`text` | *string* | **Required** · Message string |
| →&nbsp;`textPlural` | *string* | Plural version of the message string |
| →&nbsp;`context` | *string* | Message context · if empty or omitted, the message will be added without a context |
| →&nbsp;`references` | *string[]* | Array of file references where the message was extracted from<br/>Usually in the format `<filename>:<linenumber>` |
| →&nbsp;`comments` | *string[]* | Array of comments for this message |

##### Return Value

*void*

---



#### `toGettextMessages()`

*Converts the extracted messages to an object of contexts in Gettext format.*

##### Return Value

*object* · All extracted message data · The format is compatible with [gettext-parser][gettext-parser-translations]

###### Example

```json
{
  "": {
    "Foo": {
      "msgid": "Foo",
      "comments": {
        "reference": "src/foo.ts:42"
      }
    }
  },
  "Different context": {
    "Foo in a different context": {
      "msgid": "Foo in a different context",
      "msgid_plural": "Foos in a different context",
      "msgctxt": "Different context",
      "comments": {
        "reference": "src/bar.ts:157",
        "extracted": "Comment about Foo"
      }
    }
  }
}
```


#### `toPotString()`

*Converts the extracted messages to a Gettext template string.*

##### Return Value

*string* · Message template string

###### Example

```text
#: src/foo.ts:42
msgid "Foo"
msgstr ""

#: src/bar.ts:157
#. A comment
msgctxt "Different context"
msgid "Foo in a different context"
msgid_plural "Foos in a different context"
msgstr[0] ""
```


#### `savePotFile(fileName)`

*Saves the extracted messages as Gettext template into a file.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `fileName` | *string* | **Required** · Path to `.pot` file |

##### Return Value

*void*

---

#### `savePotFileAsync(fileName)`

*Saves the extracted messages as Gettext template into a file asynchronously.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `fileName` | *string* | **Required** · Path to `.pot` file |

##### Return Value

*Promise*

---

#### `getStats()`

*Gets statistics about the extracted messages.*

##### Return Value

*object* · Object containing statistics data

###### Properties

| Name | Type |
| --- | --- |
| `numberOfParsedFiles` | *number* |
| `numberOfParsedFilesWithMessages` | *number* |
| `numberOfMessages` | *number* |
| `numberOfPluralMessages` | *number* |
| `numberOfMessageUsages` | *number* |
| `numberOfContexts` | *number* |


#### `printStats()`

*Prints statistics about the extracted messages.*

##### Return Value

*void*

---

### Parser

All public methods of the parser return the parser instance itself, so it can be used as fluent API:

```javascript
extractor
    .createJsParser()
    .addExtractor(/* extractor function */)
    .parseFile('foo.jsx')
    .parseFilesGlob('src/**/*.js');
```

<br/>


#### `addExtractor(extracctor)`

*Adds an extractor function to the parser after it has been created.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `extractor` | *function* | **Required** · [Extractor Function](#extractor-functions) to be added to the parser |

##### Return Value

*this*

#### `parseString(source, fileName)`

*Parses a source code string and extracts messages.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `source` | *string* | **Required** · Source code string |
| `fileName` | *string* | File name used for references · if omitted, no references will be added

##### Return Value

*this*


#### `parseFile(fileName)`

*Reads and parses a single file and extracts messages.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `fileName` | *string* | **Required** · Path to the file to parse |

##### Return Value

*this*


#### `parseFilesGlob(pattern)`

*Reads and parses all files that match a globbing pattern and extracts messages.*

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `pattern` | *string* | **Required** · Glob pattern to match files by · see [node-glob][node-glob-primer] for details |

##### Return Value

*this*

---

### JsExtractors

*A collection of factory functions for standard extractor functions*


#### `functionCall(functionName, options)`

##### Parameters

| Name | Type | Details |
| --- | --- | --- |
| `functionName` | *string* | **Required** · Name of the function |
| `options` | *object* | Options to configure the extractor function |
| →&nbsp;`arguments` | *object* | **Required** · [Argument Mapping](#argument-mapping) |
| →&nbsp;`comments` | *object* | [Comment Options](#comment-options) |

##### Return Value

*function* · An [Extractor Function](#extractor-functions) that extracts function calls.


#### `methodCall(instanceName, methodName, options)`

##### Parameters

| Name | Type |  Details |
| --- | --- | --- |
| `instanceName` | *string* | **Required** · Name of the instance |
| `methodName` | *string* | **Required** · Name of the method |
| `options` | *object* | Options to configure the extractor function |
| →&nbsp;`arguments` | *object* | **Required** · [Argument Mapping](#argument-mapping) |
| →&nbsp;`comments` | *object* | [Comment Options](#comment-options) |
| →&nbsp;`ignoreMemberInstance` | *boolean* | If set to `true`, call expressions using `this` <br/>(e.g. `this.translations.getText('Foo')`) will **not** get extracted |

##### Return Value

*function* · An [Extractor Function](#extractor-functions) that extracts method calls.

#### Argument Mapping

| Name | Type | Details |
| --- | --- | --- |
| `text` | *number* | **Required** · Position of the argument containing the message text |
| `textPlural` | *number* | Position of the argument containing the plural version of the message text |
| `context` | *number* | Position of the argument containing the message context |

#### Comment Options

If omitted, it will extract all comments on the same line (i.e. `sameLineLeading` and `sameLineTrailing`)

| Name | Type | Default | Details |
| --- | --- | --- | --- |
| `sameLineLeading` | *boolean* | `false` | If set to `true`, all comments that are **on the same line** and appear **before** the expression will get extracted |
| `otherLineLeading` | *boolean* | `false` | If set to `true`, all comments that are on **previous lines** above the expression will get extracted |
| `sameLineTrailing` | *boolean* | `false` | If set to `true`, all comments that are **on the same line** and appear **after** the expression will get extracted |
| `regex` | *RegExp* | | If provided, comments are only extracted if their text matches this regular expression. If the regex has capturing groups, the first one will be used for extraction of the comment. |

<br/>


## Writing a Custom Extractor Function

In case you run into a scenario which is not covered by the out-of-the-box extractor functions, you can write your own.

The actual logic for extracting messages is obviously very specific to your case and will require some knowledge of how the TypeScript parser works.
A good starting point is "[Using the Compiler API][using-the-compiler-api]" from the TypeScript Github wiki. 

Here's an example of a custom extractor function without any extraction logic:

```javascript
function myCustomExtractorFunction(node, sourceFile, addMessage) {
    
    // TODO run checks and extract message data from node and sourceFile
     
    addMessage({
        text: 'Foo',
        context: 'Context'
    });
}

extractor
    .createJsParser([myCustomExtractorFunction])
    .parseFile('foo.ts');
```

Let's take a closer look at the parameters of a extractor function:

#### `node`

This is a node of the Abstract Syntax Tree. The extractor function will get called once for every node in the whole AST of a file.

#### `sourceFile`

The source file is passed through from the TypeScript parser itself and provides methods to get the line number of a node as well as other useful information.

#### `addMessage`

This is a callback function that you need to call if to add a message.  
It expects an object with message data as the only argument.

###### Properties

| Name | Type | Details |
| --- | --- | --- |
| `text` | *string* | **Required** · Message string |
| `textPlural` | *string* | Plural version of the message string |
| `context` | *string* | Message context. If empty or omitted, the message will be added to the default context |
| `comments` | *string[]* | Array of comments about this message |
| `fileName` | *string* | File name used for references · if omitted, the file name will automatically be determined using the current `sourceFile` instance |
| `lineNumber` | *number* | Line number used for references · if omitted, the line number will automatically be determined using the current `sourceFile` and `node` instance |

<br/>


## Contributing

From reporting a bug to submitting a pull request: every contribution is appreciated and welcome.
Report bugs, ask questions and request features using [Github issues][github-issues].
If you want to contribute to the code of this project, please read the [Contribution Guidelines][contributing].

[travis-status]: https://travis-ci.org/lukasgeiter/gettext-extractor.svg?branch=master
[travis-link]: https://travis-ci.org/lukasgeiter/gettext-extractor
[node-glob-primer]: https://github.com/isaacs/node-glob#glob-primer
[chalk]: https://github.com/chalk/chalk
[gettext-parser-translations]: https://github.com/smhg/gettext-parser#translations
[using-the-compiler-api]: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
[github-issues]: https://github.com/lukasgeiter/gettext-extractor/issues
[contributing]: CONTRIBUTING.md
