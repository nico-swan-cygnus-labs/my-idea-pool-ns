'use strict';
/*
 *A collection of all the user model related custom errors
 */
import ModelError from './model.js';

const CONTENT_NOT_STRING_ERROR = 'The content provided is not a string';
const CONTENT_EXCEED_SIZE_ERROR = 'The content must be less than 255 charterers';
const METRIC_NOT_NUMBER_ERROR = 'The metric provided is not a number';
const METRIC_NOT_IN_RANGE_ERROR = 'The metric must be a number between 1 and 10';
const DATE_NOT_NUMBER_ERROR = 'Date is not a number';
const DATE_NOT_VALID_EPOCH_ERROR = 'Date is not a valid epoch number';

class InvalidDateValue extends ModelError {
    constructor() {
        super(DATE_NOT_VALID_EPOCH_ERROR);
    }
}

class DateNaN extends ModelError {
    constructor() {
        super(DATE_NOT_NUMBER_ERROR);
    }
}

class MetricNotInRange extends ModelError {
    constructor(name) {
        super(`${name} - ${METRIC_NOT_IN_RANGE_ERROR}`);
    }
}

class MetricNaN extends ModelError {
    constructor(name) {
        super(`${name} - ${METRIC_NOT_NUMBER_ERROR}`);
    }
}

class ContentNaS extends ModelError {
    constructor() {
        super(CONTENT_NOT_STRING_ERROR);
    }
}

class ContentExceedSize extends ModelError {
    constructor() {
        super(CONTENT_EXCEED_SIZE_ERROR);
    }
}

export {
    InvalidDateValue,
    DateNaN,
    MetricNotInRange,
    MetricNaN,
    ContentNaS,
    ContentExceedSize
};

