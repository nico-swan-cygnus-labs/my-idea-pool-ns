'use strict';
import _ from 'lodash';
import mongodb from 'mongodb';
import {
    ContentExceedSize,
    ContentNaS,
    DateNaN,
    InvalidDateValue,
    MetricNaN,
    MetricNotInRange
} from '../services/errors/idea_model.js';
const ObjectID = mongodb.ObjectID;

/**
* @typedef IdeaModel
* @property {string} id The unique record id of the idea. - eg: tg2b9rh1i
* @property {string} content The idea description with a maximum 255 characters. - eg: My awesome idea
* @property {integer} impact Impact score between 1 to 10, 10 being the highest impact. - eg: 10
* @property {integer} ease Ease score between 1 to 10, 10 being the highest impact. - eg: 7
* @property {integer} confidence Confidence score between 1 to 10, 10 being the highest impact. - eg: 9
* @property {integer} averageScore The average score between Impact, Ease and Confidence . - eg: 8.666666666666667
* @property {integer} createdAt The epoch timestamp of when the idea was saved. - eg: 1553657927
*/

class IdeaModel {
    /**
     * @constructor
     * @param {object} _idea Optional: The super awesome idea object 
     */
    constructor(_idea) {
        const idea = _idea || {};
        /** @private */
        this._id = idea._id || idea.id || undefined;
        if (this._id instanceof ObjectID) {
            this._id = this._id.toString();
        }
        /** @private */
        this._content = (idea.content) ?
            this._validateContent(idea.content) :
            undefined;
        /** @private */
        this._impact = (idea.impact || idea.impact === 0) ?
            this._validateMetric('impact', idea.impact) :
            undefined;
        /** @private */
        this._ease = (idea.ease || idea.ease === 0) ?
            this._validateMetric('ease', idea.ease) :
            undefined;
        /** @private */
        this._confidence = (idea.confidence || idea.confidence === 0) ?
            this._validateMetric('confidence', idea.confidence) :
            undefined;
        /** @private */
        this._averageScore = this._avgScores();
        /** @private */
        this._createdAt = (idea.created_at) ? this._validateDate(idea.created_at) : Math.floor(new Date / 1000); //Epoch timestamp          
    }
    /**
     * Get the unique id for the idea
     * @memberof IdeaModel
     */
    get id() {
        return this._id;
    }
    /**
     * Get the content for the idea
     * @memberof IdeaModel
     */
    get content() {
        return this._content;
    }
    /**
     * Get the impact metric
     * @readonly
     * @memberof IdeaModel
     */
    get impact() {
        return this._impact;
    }
    /**
     * Get the ease metric
     * @readonly
     * @memberof IdeaModel
     */
    get ease() {
        return this._ease;
    }
    /**
     * Get the confidence metric
     * @readonly
     * @memberof IdeaModel
     */
    get confidence() {
        return this._confidence;
    }
    /**
     * Calculate the get the average scores of the metrics
     * @readonly
     * @memberof IdeaModel
     */
    get averageScore() {
        return this._avgScores();
    }
    /**
     * Get the create at value
     * @readonly
     * @memberof IdeaModel
     */
    get createdAt() {
        return this._createdAt;
    }
    /**
     * Set a unique id for the metric
     * @memberof IdeaModel
     */
    set id(value) {
        if (value instanceof ObjectID) {
            this._id = value.toString();
        } else {
            this._id = value;
        }
    }
    /**
     * Set the content for the idea
     * @memberof IdeaModel
     */
    set content(value) {
        this._content = this._validateContent(value);
    }
    /**
     * Set the impact metric
     * @memberof IdeaModel
     */
    set impact(value) {
        this._impact = this._validateMetric('impact', value);
    }
    /**
     * Set the ease metric
     * @memberof IdeaModel
     */
    set ease(value) {
        this._ease = this._validateMetric('ease', value);
    }
    /**
     * Set the confidence metric
     * @memberof IdeaModel
     */
    set confidence(value) {
        this._confidence = this._validateMetric('confidence', value);
    }
    /**
     * Set the created at timestamp
     * @memberof IdeaModel
     */
    set createdAt(value) {
        this._createdAt = this._validateDate(value);
    }

    /**
     * Convert Model to JSON
     * @return {User} The JSON object of the user model
     * @memberof UserModel
     */
    toJson() {
        return {
            /* jshint camelcase: false */
            id: this._id,
            content: this._content,
            impact: this._impact,
            ease: this._ease,
            confidence: this._confidence,
            average_score: this._avgScores(),
            created_at: this._createdAt
            /* jshint camelcase: true */
        }
    }

    /**
     * Calculate the average score of the impact,ease and confidence metrics. 
     * @return {float} The average score rounded to 15 decimals
     * @memberof IdeaModel
     */
    _avgScores() {
        return parseFloat((((this._confidence || 0) + (this._ease || 0) + (this._impact || 0)) / 3).toFixed(15));
    }
    /**
     * Validate if the content is a string and that is no more that 255 characters 
     * @param  {string} value The content of the idea 
     * @return {string} The validated value
     * @memberof IdeaModel
     */
    _validateContent(value) {
        if (!_.isString(value)) {
            throw new ContentNaS();
        } else if (value.length > 255) {
            throw new ContentExceedSize();
        }
        return value;
    }
    /**
     * Validate if the value is a number and between 1 and 10
     * @param  {number} value The metric value to be tested 
     * @return {number} The value of the metric
     * @memberof IdeaModel
     */
    _validateMetric(name, value) {
        if (!_.isNumber(value)) {
            throw new MetricNaN(name);
        } else if (!(value <= 10 && value >= 1)) {
            throw new MetricNotInRange(name);
        }
        return value;
    }
    /**
     * Validate if the value given is a valid epoch number
     * @param  {integer} value The Epoch timestamp value that isn't 1970
     * @return {integer} The Epoch timestamp
     * @memberof IdeaModel
     */
    _validateDate(value) {
        if (!_.isNumber(value)) {
            throw new DateNaN();
        } else if ((new Date(value * 1000).getFullYear() == '1970')) {
            throw new InvalidDateValue();
        }
        return value;
    }
}

export default IdeaModel;