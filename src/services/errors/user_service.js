'use strict';
/*
 * A collection of all the user service related custom errors
 */
import BaseError from './error.js';

const USER_NOT_FOUND = 'User not found';
const USER_EXIST = 'User already exist';
const INVALID_PASSWORD = 'Wrong password';

/**
 * Custom request errors
 * @class UserServiceError
 * @extends BaseError
 */
class UserServiceError extends BaseError {
    constructor(message, error) {
        super(message, error);
        this.status = 400;
        this.type = 'User service'
    }
}

class UserExists extends UserServiceError {
    constructor(error) {
        super(USER_EXIST);
    }
}

class UserNotFound extends UserServiceError {
    constructor(error) {
        super(USER_NOT_FOUND, error);
    }
}

class InvalidPassword extends UserServiceError {
    constructor() {
        super(INVALID_PASSWORD);
        this.status = 401;
    }
}


export {
    UserServiceError,
    UserExists,
    UserNotFound,
    InvalidPassword
};

