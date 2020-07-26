'use strict';
import _ from 'lodash';

const INTERNAL_SERVER_ERROR = 'Internal server error';

/**
 * A custom base error class for error handling
 * @class BaseError
 * @extends Error
 */
class BaseError extends Error {
    constructor(message, error) {
        super(message);
        this.name = this.constructor.name;
        this.type = INTERNAL_SERVER_ERROR;
        this.message = message;
        this.status = 500;
        if (!_.isEmpty(error)) {
            this.stack = error.stack;
            this.error = {};
            this.error.name = error.name;
            this.error.message = error.message;
            this.error.description = error.description;
            this.error.number = error.number;
        }
    }
    toJson(showStack) {
        let json = {
            name: this.name,
            type: this.type,
            status: this.status,
            message: this.message,
            error: this.error
        };
        if (showStack) { json.stack = this.stack; }
        return json;
    }
}

export default BaseError; 