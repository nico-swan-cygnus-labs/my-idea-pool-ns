'use strict';
/*
 * A collection of all the token manager related custom errors
 */
import BaseError from './error.js';

const IDEA_NOT_FOUND = 'The idea was not found';
const IDEA_ID_MISSING = 'Missing id parameter';
const INVALID_PAGE_RANGE = 'Page must be an integer number and greater that 0';
const INVALID_LAST_SCORE = 'Last score must ba a number or decimal and greater that 0'

/**
 * Custom request errors
 * @class IdeaError
 * @extends BaseError
 */
class IdeaError extends BaseError {
    constructor(message, error) {
        super(message, error);
        this.status = 400;
        this.type = 'Idea service'
    }
}

class IdeaIdMissing extends IdeaError {
    constructor() {
        super(IDEA_ID_MISSING);
    }
}

class IdeaNotFound extends IdeaError {
    constructor(error) {
        super(IDEA_NOT_FOUND, error);
    }
}

class IdeaInsertError extends IdeaError {
    constructor(error) {
        super(error.message, error);
    }
}

class IdeaUpdateError extends IdeaError {
    constructor(error) {
        super(error.message, error);
    }
}

class IdeaDeleteError extends IdeaError {
    constructor(error) {
        super(error.message, error);
    }
}

class IdeaRetrievalError extends IdeaError {
    constructor(error) {
        super(error.message, error);
    }
}

class InvalidPageNumber extends IdeaError {
    constructor() {
        super(INVALID_PAGE_RANGE);
    }
}

class InvalidLastScore extends IdeaError {
    constructor() {
        super(INVALID_LAST_SCORE);
    }
}

export {
    IdeaError,
    IdeaNotFound,
    IdeaInsertError,
    IdeaUpdateError,
    IdeaDeleteError,
    IdeaIdMissing,
    IdeaRetrievalError,
    InvalidPageNumber,
    InvalidLastScore
};

