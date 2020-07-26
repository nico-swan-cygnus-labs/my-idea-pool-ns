'use strict';
import jwt from 'jsonwebtoken';
import { v1 as uuidV1 } from 'uuid';
import config from '../../../config/token.js';
import UserModel from '../../models/user.js';
import Users from '../../persistence/mongodb/users.js';
import { NotFound } from '../errors/database.js';
import {
    MalformedAccessToken,
    RefreshTokenExpired,
    RefreshTokenMismatch, TokenExpired,
    TokenManagerError,
    UserNotFound
} from '../errors/token_manager.js';

/**
 * Manage the json web token operations.
 *
 * @export
 * @class TokenManagerService
 */
class TokenManagerService {

    /**
     * @constructor
     */
    constructor(db) {
        this.secretKey = config.secretKey;
        this.jwtExpiresIn = config.jwtExpiresIn; // default 10m
        this.refreshExpiresIn = config.refreshExpiresIn; // in hours;
        this.users = new Users(db);
    }
    /**
     * Verify access token and get user to be stored in the request
     * @param  {string} accessToken The user jwt token
     * @param {boolean} isRefreshRequest indicated if the request is a refresh request 
     * @return {UserModel} The user information 
     * @memberof TokenManagerService
     */
    verify(accessToken, isRefreshRequest) {
        try {
            isRefreshRequest = (isRefreshRequest) ? isRefreshRequest : false;
            //If this is a refresh request the token might be expired so skip the check
            const decoded = jwt.verify(accessToken, this.secretKey, { ignoreExpiration: isRefreshRequest });
            return decoded;
        } catch (error) {
            if (error.message === 'jwt malformed') {
                throw new MalformedAccessToken()
            } else if (error.message === 'jwt expired') {
                throw new TokenExpired()
            }
            else {
                throw new TokenManagerError(error.message, error);
            }
        }
    }
    /**
     * Create a new token for the user
     * @param  {string} email The user's email address
     * @param  {string} password The user's password
     * @return {AccessTokenResponse} A valid new token pair
     * @memberof TokenManagerService
     */
    create(user) {
        return new Promise((resolve, reject) => {
            const newAccessToken = this._generateAccessToken(user);
            const newRefreshToken = this._generateRefreshToken();
            return this.update(user, newAccessToken, newRefreshToken)
                .then(user => {
                    let tokens = {
                        /* jshint camelcase: false */
                        jwt: user.accessToken,
                        refresh_token: user.refreshToken
                        /* jshint camelcase: true */
                    };
                    resolve(tokens);
                })
                .catch(error => {
                    if (error instanceof NotFound) {
                        reject(new UserNotFound());
                    } else {
                        reject(new TokenManagerError(error.message, error));
                    }
                });
        });
    }
    /**
     * Refresh the JWT when a valid refresh token received 
     * @param  {UserModel} user The current user  
     * @param  {string} refreshToken The refresh token from the request 
     * @return {RefreshTokenResponse} Only the JWT Token. 
     * @memberof TokenManagerService
     */
    refresh(user, refreshToken) {
        return new Promise((resolve, reject) => {

            if ((user.refreshToken === refreshToken)) {
                if (!this._hasRefreshTokenExpired(refreshToken)) {
                    const newTokens = this.generateTokens(user);
                    return this.update(user, newTokens.jwt, user.refreshToken)
                        .then(() => {
                            resolve(newTokens);
                        })
                        .catch(error => {
                            if (error instanceof NotFound) {
                                reject(new UserNotFound());
                            } else {
                                reject(new TokenManagerError(error.message, error));
                            }
                        });
                } else {
                    reject(new RefreshTokenExpired());
                }
            } else {
                reject(new RefreshTokenMismatch());
            }
        });
    }
    /**
     * Update user tokens with new values
     * @param  {UserModel} user 
     * @param  {} newAccessToken 
     * @param  {any} newRefreshToken 
     * @return 
     * @memberof TokenManagerService
     */
    update(user, newAccessToken, newRefreshToken) {
        return new Promise((resolve, reject) => {
            return this.users.updateTokens(user.email, newAccessToken, newRefreshToken)
                .then(() => {
                    if (newAccessToken && newRefreshToken) {
                        user.accessToken = newAccessToken;
                        user.refreshToken = newRefreshToken;
                    }
                    resolve(user);
                })
                .catch((error) => reject(error));
        });
    }
    /**
     * Delete tokens from when the supplied refresh token has been given.
     * @param  {UserModel} user The current logged in user
     * @param  {string} refreshToken the refresh token from the request.
     * @return {none} 
     * @memberof TokenManagerService
     */
    delete(user, refreshToken) {
        return new Promise((resolve, reject) => {
            if ((user.refreshToken === refreshToken)) {
                if (!this._hasRefreshTokenExpired(refreshToken)) {
                    return this.update(user, undefined, undefined)
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => reject(new TokenManagerError(error.message, error)));
                } else {
                    reject(new RefreshTokenExpired());
                }
            } else {
                reject(new RefreshTokenMismatch());
            }
        });
    }
    /**
     * Generate both tokens
     * @param  {UserModel} user 
     * @return {object} Tokens json object
     * @memberof TokenManagerService
     */
    generateTokens(user) {
        return {
            /* jshint camelcase: false */
            jwt: this._generateAccessToken(user),
            refresh_token: this._generateRefreshToken()
            /* jshint camelcase: true */
        }
    }
    /**
     * Generate the JTW access token with a secret and expire date
     * Use default algorithm 
     * @param  {UserModel} user The authenticated user. 
     * @return {string} jtw token sting used as the access token
     * @memberof TokenManagerService
     */
    _generateAccessToken(user) {
        const accessToken = jwt.sign({
            email: user.email,
            name: user.name,
            id: user.id,
        }, this.secretKey, { expiresIn: this.jwtExpiresIn });
        return accessToken;
    }
    /**
     * Generate the refresh token. the token is a mix between and uuid and the exploration date in epoch format
     * @return {string} Base 64 encoded string
     * @memberof TokenManagerService
     */
    _generateRefreshToken() {
        const dateNow = new Date().getTime();
        const milSecToExpireOn = 60 * 60 * this.refreshExpiresIn * 1000;
        const expireTime = dateNow + milSecToExpireOn; //Epoch timestamp
        const buff = new Buffer.from(`${uuidV1()}:${expireTime}`);
        return buff.toString('base64');
    }
    /**
     * 
     * @param  {any} refreshToken 
     * @return {Boolean} True if the expiry data has not passed
     * @memberof TokenManagerService
     */
    _hasRefreshTokenExpired(refreshToken) {
        try {
            const buff = new Buffer.from(refreshToken, 'base64');
            const data = buff.toString('ascii');
            const expireTime = Number(data.split(':')[1]);
            const currentTime = new Date().getTime(); //Epoch timestamp 
            return (expireTime < currentTime);
        } catch (error) {
            throw new TokenManagerError(error.message, error)
        }
    }

}

export default TokenManagerService;

