'use strict';
/*
 *A collection of all the user model related custom errors
 */
import ModelError from './model.js';

const INVALID_EMAIL_ERROR = 'Invalid email address';
const NIL_EMAIL_ERROR = 'Missing email, please provide email address';
const NIL_PASSWORD_ERROR = 'Missing password, please provide';
const PASSWORD_CONTAIN_PASSWORD_ERROR = 'Password should not contain password';
const NIL_NAME_ERROR = 'Missing name, please provide your full display name';
const NIL_ACCESS_TOKEN_ERROR = 'Missing access token, please provide valid JWT token';
const INVALID_ACCESS_TOKEN_ERROR = 'Invalid access token';
const NIL_AVATAR_URL = 'Missing avatar url, please provide url.'

class InvalidEmailFormat extends ModelError {
    constructor() {
        super(INVALID_EMAIL_ERROR);
    }
}

class EmptyEmail extends ModelError {
    constructor() {
        super(NIL_EMAIL_ERROR);
    }
}

class EmptyPassword extends ModelError {
    constructor() {
        super(NIL_PASSWORD_ERROR);
    }
}

class ContainPassword extends ModelError {
    constructor() {
        super(PASSWORD_CONTAIN_PASSWORD_ERROR);
    }
}

class EmptyName extends ModelError {
    constructor() {
        super(NIL_NAME_ERROR);
    }
}

class EmptyToken extends ModelError {
    constructor() {
        super(NIL_ACCESS_TOKEN_ERROR);
    }
}

class EmptyAvatarUrl extends ModelError {
    constructor() {
        super(NIL_AVATAR_URL);
    }
}

class InvalidTokenFormat extends ModelError {
    constructor() {
        super(INVALID_ACCESS_TOKEN_ERROR);
    }
}

export {
    InvalidEmailFormat,
    InvalidTokenFormat,
    EmptyEmail,
    EmptyPassword,
    EmptyAvatarUrl,
    EmptyToken,
    EmptyName,
    ContainPassword,
};

