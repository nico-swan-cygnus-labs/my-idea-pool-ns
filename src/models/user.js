'use strict';
import gravatar from 'gravatar';
import _ from 'lodash';
import mongodb from 'mongodb';
import validator from 'validator';
import {
    ContainPassword,
    EmptyAvatarUrl,
    EmptyEmail,
    EmptyName,
    EmptyPassword,
    EmptyToken,
    InvalidEmailFormat,
    InvalidTokenFormat
} from '../services/errors/user_model.js';

const ObjectID = mongodb.ObjectID;
/**
* @typedef User
* @type {object}
* @property {string} id The user's unique id. -eg . b5f3eeec-8075-4ce4-8751-d4bb3e66e983
* @property {string} email The user's email address also used as the username
* @property {string} name The full display name for the user. - eg: Jack Black
* @property {string} password Password (at least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 number). - eg: the-Secret-123
* @property {string} avatarUrl The user's gravatar profile image url. - eg: https://www.gravatar.com/avatar/b36aafe03e05a85031fd8c411b69f792?d=mm&s=200
* @property {Tokens} tokens The Access tokens
*/

/**
* @typedef Tokens
* @type {object}
* @property {string} accessToken Current active access token.
* @property {string} refreshToken Current active refresh token.
*/

/**
 * The user model and methods to manage the data.
 *
 * @export
 * @class UserModel
 */
class UserModel {

    /**
     * @constructor
     * @param {UserObject} _user Optional: The current user object
     */
    constructor(_user) {
        const user = _user || {};
        /** @private */
        this._id = user._id || user.id || undefined;
        if (this._id instanceof ObjectID) {
            this._id = this._id.toString();
        }
        /** @private */
        this._email = (!_.isEmpty(user.email)) ? this._validateEmail(user.email) : undefined;
        /** @private */
        this._name = user.name || undefined;
        /** @private */
        this._password = (!_.isEmpty(user.password)) ? this._validatePassword(user.password) : undefined;
        /** @private */
        this._avatarUrl = undefined;
        /* jshint camelcase: false */
        if (!_.isEmpty(user.avatar_url)) {
            this._avatarUrl = user.avatar_url;
        } else {
            this._avatarUrl = (!_.isEmpty(user.email)) ?
                gravatar.url(user.email, { protocol: true }) :
                undefined;
        }
        if (!_.isEmpty(user.tokens)) {
            /** @private */
            this._accessToken = (!_.isEmpty(user.tokens.access_token)) ?
                this._validateToken(user.tokens.access_token) :
                undefined;
            /** @private */
            this._refreshToken = user.tokens.refresh_token || undefined;
            /* jshint camelcase: true */
        }
    }
    // Getters
    /**
     * Get the unique id for the idea
     * @memberof UserModel
     */
    get id() {
        return this._id;
    }
    /**
     * The email address of the user 
     * @memberof UserModel
     */
    get email() {
        return this._email;
    }
    /**
     * The full display name for the user
     * @readonly
     * @memberof User
     */
    get name() {
        return this._name;
    }

    /**
     * The user's secret password
     * @readonly
     * @memberof UserModel
     */
    get password() {
        return this._password;
    }

    /**
     * The user gravatar url to display the user profile - eg:  https://www.gravatar.com/avatar/<EMAIL MD5 HASH>?d=mm&s=200
     * @readonly
     * @memberof UserModel
     */
    get avatarUrl() {
        return this._avatarUrl;
    }

    /**
     * The current active JWT access token
     * @readonly
     * @memberof UserModel
     */
    get accessToken() {
        return this._accessToken;
    }

    /**
     * The current active refresh token to get a new access token
     * @readonly
     * @memberof UserModel
     */
    get refreshToken() {
        return this._refreshToken;
    }

    /**
    * Set a unique id for the metric
    * @memberof UserModel
    */
    set id(value) {
        if (value instanceof ObjectID) {
            this._id = value.toString();
        } else {
            this._id = value;
        }
    }

    /**
     * Set and valid the email address for the user.  
     * @param {string} emailAddress The primary email address for the user used as the username
     * @memberof UserModel
     */
    set email(emailAddress) {
        this._email = this._validateEmail(emailAddress);
    }

    /**
     * Set and validate the password for the user.  
     * @param {string} passwordValue The user's password
     * @memberof UserModel
     */
    set password(passwordValue) {
        this._password = this._validatePassword(passwordValue);
    }

    /**
     * Set user's display name.  
     * @param {string} displayName The full name of the user
     * @memberof UserModel
     */
    set name(displayName) {
        if (_.isEmpty(displayName)) {
            throw new EmptyName
        }
        this._name = displayName;
    }
    /**
     * Set user's avatar URL.  
     * @param {string} avatarUrl The users email address
     * @memberof UserModel
     */
    set avatarUrl(avatarUrl) {
        if (_.isEmpty(avatarUrl)) {
            if (_.isEmpty(this._email)) {
                throw new EmptyAvatarUrl;
            } else {
                // When there is no gravatar images for the user it will use a default
                this._avatarUrl = gravatar.url(this._email, { protocol: true });
            }
        } else {
            this._avatarUrl = avatarUrl;
        }
    }

    /**
     * Set and valid the access token.  
     * @param {string} jwt The jwt access token
     * @memberof UserModel
     */
    set accessToken(jwt) {
        this._accessToken = this._validateToken(jwt);
    }

    /**
     * Set the refresh token.  
     * @param {string} token The refresh token
     * @memberof UserModel
     */
    set refreshToken(token) {
        this._refreshToken = token;
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
            email: this._email,
            name: this._name,
            password: this._password,
            avatar_url: this._avatarUrl,
            tokens: {
                access_token: this._accessToken,
                refresh_token: this._refreshToken

            }
            /* jshint camelcase: true */
        }
    }

    /**
     * Validates an string if it is a valid email address
     * @param  {string} emailAddress 
     * @return {string} The valid email address
     * @memberof UserModel
     * @private
     */
    _validateEmail(emailAddress) {
        if (_.isEmpty(emailAddress)) {
            throw new EmptyEmail
        } else if (!validator.isEmail(emailAddress)) {
            throw new InvalidEmailFormat
        }
        return emailAddress;
    }

    /**
     * Validate if a password is strong 
     * @param  {string} passwordValue 
     * @return {string} The password string
     * @memberof UserModel
     * @private
     */
    _validatePassword(passwordValue) {
        if (_.isEmpty(passwordValue)) {
            throw new EmptyPassword
        } else if (validator.equals(passwordValue.toLowerCase(), 'password')) {
            throw new ContainPassword
        } else if (validator.contains(passwordValue.toLowerCase(), 'password')) {
            throw new ContainPassword
        }
        return passwordValue;
    }

    /**
     * Validate if the access token is a valid JWT 
     * @param  {string} accessToken The access token string
     * @return {string} The valid access token
     * @memberof UserModel
     * @private
     */
    _validateToken(accessToken) {
        if (validator.isEmpty(accessToken || '')) {
            throw new EmptyToken
        } else if (!validator.isJWT(accessToken)) {
            throw new InvalidTokenFormat
        }
        return accessToken;
    }

}

export default UserModel;

