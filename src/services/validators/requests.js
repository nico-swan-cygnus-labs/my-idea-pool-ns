'use strict';
import _ from 'lodash';
import { MissingProperty } from '../../services/errors/request.js';
/**
* Validate required properties for an HTTP request
* @param {string[]} requireProperties The property names that are required to test 
* @param {Request} request The http request object
* @return {Promise<Boolean>} true if successful
* @return {MissingProperty} Bad Request error for a missing property
*/
const validateRequired = (request, requireProperties) => {
    return new Promise((resolve, reject) => {
        requireProperties.forEach(property => {
            if (!_.has(request.body, property)) {
                reject(new MissingProperty(property, request));
            }
        });
        resolve();
    });
};

export {
    validateRequired
};

