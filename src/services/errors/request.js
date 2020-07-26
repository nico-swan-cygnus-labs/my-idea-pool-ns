'use strict';
/*
 * A collection of all the token manager related custom errors
 */
import BaseError from './error.js';

const UNAUTHORIZED_ERROR = 'Authentication';
const NOT_FOUND_ERROR = 'Not found';
const MISSING_PARAMETER_ERROR = 'Missing property';
const MISSING_ACCESS_TOKEN_ERROR = 'Missing access token, please provide';
/**
 * Custom request errors
 * @class RequestError
 * @extends BaseError
 */
class RequestError extends BaseError {
    constructor(message, request, error) {
        super(message, error);
        this.request = request
        this.status = 400;
        if (request) {
            this.path = request.path;
        }
    }
    toJson() {
        let json = super.toJson()
        if (this.path) { json.request_path = this.path; }
        return json;
    }
}

class InternalServerError extends RequestError {
    constructor(message, request, error) {
        super(message, request, error);
        this.type = error.name;
        this.status = 500;
    }
}

class BadRequest extends RequestError {
    constructor(message, request, error) {
        super(message, request, error);
    }
}

class MissingProperty extends BadRequest {
    constructor(parameter, request, error) {
        super('Please provide ' + parameter, request, error);
        this.type = MISSING_PARAMETER_ERROR;
    }
}


class Unauthorized extends RequestError {
    constructor(message, request, error) {
        super(`Please authenticate! : ${message}`);
        this.type = UNAUTHORIZED_ERROR;
        this.name = 'Unauthorized';
        this.status = 401;
    }
}

class MissingAccessToken extends RequestError {
    constructor(request, error) {
        super(MISSING_ACCESS_TOKEN_ERROR, request, error);
        this.type = UNAUTHORIZED_ERROR;
        this.name = 'Unauthorized';
        this.status = 401;
    }
}

class NotFound extends RequestError {
    constructor(request) {
        super('API endpoint not found', request);
        this.type = NOT_FOUND_ERROR;
        this.status = 404;
    }
}

export {
    MissingProperty,
    RequestError,
    BadRequest,
    Unauthorized,
    NotFound,
    InternalServerError,
    MissingAccessToken
};

