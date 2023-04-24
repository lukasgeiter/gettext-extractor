"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
class Validate {
    constructor(required) {
        this.required = required;
    }
    static get required() {
        return new Validate(true);
    }
    static get optional() {
        return new Validate(false);
    }
    argument(args) {
        this.entry = this.argument;
        this.each(args, () => { });
    }
    booleanProperty(object, path) {
        this.entry = this.booleanProperty;
        this.property(object, path, (name, value) => {
            if (typeof value !== 'boolean') {
                throw this.typeError(`Property '${name}' must be a boolean`);
            }
        });
    }
    string(args) {
        this.entry = this.string;
        this.each(args, (name, value) => {
            if (typeof value !== 'string') {
                throw this.typeError(`'Argument '${name}' must be a string`);
            }
        });
    }
    nonEmptyString(args) {
        this.entry = this.nonEmptyString;
        this.each(args, (name, value) => {
            if (typeof value !== 'string' || value.length === 0) {
                throw this.typeError(`'Argument '${name}' must be a non-empty string`);
            }
        });
    }
    stringProperty(object, path) {
        this.entry = this.stringProperty;
        this.property(object, path, (name, value) => {
            if (typeof value !== 'string') {
                throw this.typeError(`Property '${name}' must be a string`);
            }
        });
    }
    numberProperty(object, path) {
        this.entry = this.numberProperty;
        this.property(object, path, (name, value) => {
            if (typeof value !== 'number' || isNaN(value)) {
                throw this.typeError(`Property '${name}' must be a number`);
            }
        });
    }
    functionProperty(object, path) {
        this.entry = this.functionProperty;
        this.property(object, path, (name, value) => {
            if (typeof value !== 'function') {
                throw this.typeError(`Property '${name}' must be a function`);
            }
        });
    }
    object(args) {
        this.entry = this.object;
        this.each(args, (name, value) => {
            if (typeof value !== 'object' || value === null) {
                throw this.typeError(`Argument '${name}' must be an object`);
            }
        });
    }
    nonEmptyArray(args) {
        this.entry = this.nonEmptyArray;
        this.each(args, (name, value) => {
            if (!(value instanceof Array) || value.length === 0) {
                throw this.typeError(`Argument '${name}' must be a non-empty array`);
            }
        });
    }
    arrayProperty(object, path) {
        this.entry = this.arrayProperty;
        this.property(object, path, (name, value) => {
            if (!(value instanceof Array)) {
                throw this.typeError(`Property '${name}' must be an array`);
            }
        });
    }
    regexProperty(object, path) {
        this.entry = this.regexProperty;
        this.property(object, path, (name, value) => {
            if (!(value instanceof RegExp)) {
                throw this.typeError(`Property '${name}' must be a regular expression`);
            }
        });
    }
    each(args, callback) {
        for (let name of Object.keys(args)) {
            let value = args[name];
            if (value !== undefined) {
                callback(name, value);
            }
            else if (this.required) {
                throw this.error(`Missing argument '${name}'`);
            }
        }
    }
    property(object, path, callback) {
        let properties = path.split('.');
        let value = object;
        let name = properties.shift();
        if (!value && !this.required) {
            return;
        }
        this.object({ [name]: value });
        let property;
        while (property = properties.shift()) {
            name += `.${property}`;
            value = value[property];
            if (properties.length) {
                if (typeof value !== 'object' || value === null) {
                    if (value !== undefined || this.required) {
                        throw this.typeError(`Property '${name}' must be an object`);
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                if (value !== undefined) {
                    callback(name, value);
                }
                else if (this.required) {
                    throw this.error(`Property '${name}' is missing`);
                }
            }
        }
    }
    typeError(message) {
        let error = new TypeError(message);
        Error.captureStackTrace(error, this.entry);
        return error;
    }
    error(message) {
        let error = new Error(message);
        Error.captureStackTrace(error, this.entry);
        return error;
    }
}
exports.Validate = Validate;
