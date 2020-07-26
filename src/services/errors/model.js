'use strict';
import BaseError from './error.js';
/**
 * Custom model error base class
 * @class ModelError
 * @extends BaseError
 */
class ModelError extends BaseError {
    constructor(message, error) {
        super(message, error);
        this.type = 'Data model'
        this.status = 400;
    }
}
export default ModelError;
