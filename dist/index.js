"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlExtractors = exports.JsExtractors = exports.GettextExtractor = void 0;
var extractor_1 = require("./extractor");
Object.defineProperty(exports, "GettextExtractor", { enumerable: true, get: function () { return extractor_1.GettextExtractor; } });
var extractors_1 = require("./js/extractors");
Object.defineProperty(exports, "JsExtractors", { enumerable: true, get: function () { return extractors_1.JsExtractors; } });
var extractors_2 = require("./html/extractors");
Object.defineProperty(exports, "HtmlExtractors", { enumerable: true, get: function () { return extractors_2.HtmlExtractors; } });
