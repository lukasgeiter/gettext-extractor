export type Arguments = {[name: string]: any};

export class Validate {

    private entry: Function;

    public static get required(): Validate {
        return new Validate(true);
    }

    public static get optional(): Validate {
        return new Validate(false);
    }

    constructor(
        private required: boolean
    ) {}

    public argument(args: Arguments): void {
        this.entry = this.argument;
        this.each(args, () => {});
    }

    public booleanProperty(object: any, path: string): void {
        this.entry = this.booleanProperty;
        this.property(object, path, (name, value) => {
            if (typeof value !== 'boolean') {
                throw this.typeError(`Property '${name}' must be a boolean`);
            }
        });
    }

    public string(args: Arguments): void {
        this.entry = this.string;
        this.each(args, (name, value) => {
            if (typeof value !== 'string') {
                throw this.typeError(`'Argument '${name}' must be a string`);
            }
        });
    }

    public nonEmptyString(args: Arguments): void {
        this.entry = this.nonEmptyString;
        this.each(args, (name, value) => {
            if (typeof value !== 'string' || value.length === 0) {
                throw this.typeError(`'Argument '${name}' must be a non-empty string`);
            }
        });
    }

    public stringProperty(object: any, path: string): void {
        this.entry = this.stringProperty;
        this.property(object, path, (name, value) => {
            if (typeof value !== 'string') {
                throw this.typeError(`Property '${name}' must be a string`);
            }
        });
    }

    public numberProperty(object: any, path: string): void {
        this.entry = this.numberProperty;
        this.property(object, path, (name, value) => {
            if (typeof value !== 'number' || isNaN(value)) {
                throw this.typeError(`Property '${name}' must be a number`);
            }
        });
    }

    public object(args: Arguments): void {
        this.entry = this.object;
        this.each(args, (name, value) => {
            if (typeof value !== 'object' || value === null) {
                throw this.typeError(`Argument '${name}' must be an object`);
            }
        });
    }

    public nonEmptyArray(args: Arguments): void {
        this.entry = this.nonEmptyArray;
        this.each(args, (name, value) => {
            if (!(value instanceof Array) || value.length === 0) {
                throw this.typeError(`Argument '${name}' must be a non-empty array`);
            }
        });
    }

    public arrayProperty(object: any, path: string): void {
        this.entry = this.arrayProperty;
        this.property(object, path, (name, value) => {
            if (!(value instanceof Array)) {
                throw this.typeError(`Property '${name}' must be an array`);
            }
        });
    }

    public regexProperty(object: any, path: string): void {
        this.entry = this.regexProperty;
        this.property(object, path, (name, value) => {
            if (!(value instanceof RegExp)) {
                throw this.typeError(`Property '${name}' must be a regular expression`);
            }
        });
    }

    private each(args: Arguments, callback: (name: string, value: any) => void): void {
        for (let name of Object.keys(args)) {
            let value = args[name];
            if (value !== undefined && (this.required || value !== null)) {
                callback(name, value);
            } else if (this.required) {
                throw this.error(`Missing argument '${name}'`);
            }
        }
    }

    private property(object: any, path: string, callback: (name: string, value: any) => void): void {
        let properties = path.split('.');

        let value = object;
        let name = properties.shift();

        this.object({[name]: value});

        let property: string;
        while (property = properties.shift()) {
            name += `.${property}`;
            value = value[property];

            if (properties.length) {
                if (typeof value !== 'object' || value === null) {
                    if (this.required) {
                        throw this.typeError(`Property '${name}' must be an object`);
                    } else {
                        break;
                    }
                }
            } else {
                if (value !== undefined) {
                    callback(name, value);
                } else if (this.required) {
                    throw this.error(`Property '${name}' is missing`);
                }
            }
        }
    }

    private typeError(message: string): TypeError {
        let error = new TypeError(message);
        Error.captureStackTrace(error, this.entry);
        return error;
    }

    private error(message: string): Error {
        let error = new Error(message);
        Error.captureStackTrace(error, this.entry);
        return error;
    }
}
