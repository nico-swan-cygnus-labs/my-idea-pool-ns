'use strict';
import BaseError from './error.js';

const DATABASE_CONNECTION_ERROR = 'Failed connected to database';
const DATABASE_DUPLICATE_ERROR = 'Can not add a duplicate document';
const DATABASE_NOTFOUND_ERROR = 'Document not found.';
const FAILED_REMOVE_IDEAS = 'Failed to remove user\'s related ideas';

/**
 * Custom database base class
 * @class DatabaseError
 * @extends DatabaseError
 */
class DatabaseError extends BaseError {
    constructor(message, error) {
        super(message, error);
        this.type = 'Database'
        this.status = 400;
    }
}

class Connection extends DatabaseError {
    constructor(error) {
        super(DATABASE_CONNECTION_ERROR, error)
        if (error) {
            this.message = error.message;
        }
    }
}

class Duplicate extends DatabaseError {
    constructor() {
        super(DATABASE_DUPLICATE_ERROR);
    }
}

class NotFound extends DatabaseError {
    constructor() {
        super(DATABASE_NOTFOUND_ERROR);
    }
}

class FailedRemoveIdeas extends DatabaseError {
    constructor() {
        super(FAILED_REMOVE_IDEAS);
    }
}



export {
    DatabaseError,
    Connection,
    Duplicate,
    NotFound,
    FailedRemoveIdeas
};

