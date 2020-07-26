'use strict';
/*
 * A collection of all the token manager related custom errors
 */
import BaseError from './error.js';

const TOKEN_MISMATCH = 'Access token provided does not match token stored';
const REFRESH_TOKEN_MISMATCH = 'Refresh token provided does not match token stored';
const TOKEN_EXPIRED = 'Access token has expired';
const REFRESH_TOKEN_EXPIRED = 'Refresh token has expired';
const MALFORMED_ACCESS_TOKEN = 'The access token provided is malformed, please provide a correct token';
const USER_NOT_FOUND = 'The user was not found'
const USER_LOGGED_OUT = 'The user is signed out, please sign in';

/**
 * Custom token manager error
 * @class TokenManagerError
 * @extends BaseError
 */
class TokenManagerError extends BaseError {
    constructor(message, error) {
        super(message, error);
        this.type = 'Token manager'
        this.status = 400;
    }
}


class UserLoggedOut extends TokenManagerError {
    constructor() {
        super(USER_LOGGED_OUT);
        this.type = 'Token manager'
        this.status = 401;
    }
}

class TokenMismatch extends TokenManagerError {
    constructor() {
        super(TOKEN_MISMATCH);
        this.type = 'Token manager'
        this.status = 401;
    }
}

class RefreshTokenMismatch extends TokenManagerError {
    constructor() {
        super(REFRESH_TOKEN_MISMATCH);
        this.type = 'Token manager'
        this.status = 401;
    }
}

class TokenExpired extends TokenManagerError {
    constructor() {
        super(TOKEN_EXPIRED);
        this.type = 'Token manager'
        this.status = 401;
    }
}
class RefreshTokenExpired extends TokenManagerError {
    constructor() {
        super(REFRESH_TOKEN_EXPIRED);
        this.type = 'Token manager'
        this.status = 401;
    }
}


class MalformedAccessToken extends TokenManagerError {
    constructor() {
        super(MALFORMED_ACCESS_TOKEN);
        this.type = 'Token manager'
        this.status = 401;
    }
}

class UserNotFound extends TokenManagerError {
    constructor() {
        super(USER_NOT_FOUND);
        this.type = 'Token manager'
        this.status = 401;
    }
}

export {
    TokenMismatch,
    TokenExpired,
    MalformedAccessToken,
    UserNotFound,
    UserLoggedOut,
    RefreshTokenExpired,
    RefreshTokenMismatch,
    TokenManagerError
};

