'use strict';
import bcrypt from 'bcryptjs';
import UserModel from '../../models/user.js';
import Users from '../../persistence/mongodb/users.js';
import { NotFound } from '../../services/errors/database.js';
import { TokenMismatch, UserLoggedOut } from '../../services/errors/token_manager.js';
import TokenManagerService from '../../services/token_manager/token_manager.js';
import { InvalidPassword, UserNotFound, UserServiceError } from '../errors/user_service.js';
const tokenManager = new TokenManagerService();

/**
 * The user service to interface with API and manage operations.
 *
 * @export
 * @class UserService
 */
class UserService {

    /**
     * @constructor
     */
    constructor(db) {
        this.users = new Users(db);
    }

    /**
     * Get the user profile information from the authenticated user
     * @param  {any} user The authenticated user from the request
     * @return {UserProfileResponse} The profile of the user
     * @memberof UserService
     * @see authenticate middleware
     */
    getProfile(user) {
        return {
            email: user.email,
            name: user.name,
            avatar_url: user.avatarUrl
        };
    }
    /**
     * Verify a users access token is the same as the stored one
     * @param  {sting} email The user email address 
     * @param  {sting} accessToken The access token to verify
     * @return {UserModel} The user object if valid
     * @memberof UserService
     */
    verifyUserAndToken(email, accessToken) {
        return new Promise((resolve, reject) => {
            return this.users.findOneByEmail(email)
                .then((user) => {
                    if (!user.accessToken) {
                        reject(new UserLoggedOut())
                    } else if (user.accessToken === accessToken) {
                        resolve(user);
                    } else {
                        reject(new TokenMismatch())
                    }
                })
                .catch(error => reject(new UserServiceError(error.message, error)))
        });
    }

    /**
     * Validate if the given password matches the stored password
     * @param  {string} email The users email address ans the username
     * @param  {string} password  The users password 
     * @return {Promise} Resolves if the password and username matches.
     * @memberof UserService
     */
    validateUserCredentials(email, password) {
        return new Promise((resolve, reject) => {
            let user;
            return this.users.findOneByEmail(email)
                .then(result => {
                    user = result;
                    return this.validatePassword(password, user.password)
                })
                .then(result => {
                    if (result) {
                        resolve(user)
                    } else {
                        reject(new InvalidPassword())
                    }
                })
                .catch((error) => {
                    if (error instanceof NotFound) {
                        let notFoundError = new UserNotFound();
                        notFoundError.status = 401;
                        notFoundError.type = 'Authentication';
                        reject(notFoundError);
                    }
                    reject(new UserServiceError(error.message, error));
                });
        });
    }

    /**
     * Sign up a user with the credentials provided
     * @param  {string} email The users email address
     * @param  {string} name The users display name 
     * @param  {string} password The password for the user
     * @return {Promise} The JWT and refresh tokens for the user
     * @memberof UserService
     */
    signUp(email, name, password) {
        return new Promise(async (resolve, reject) => {
            //Build the new user model
            let userModel = new UserModel({
                email: email,
                name: name,
                password: await this.encryptPassword(password)
            });
            const tokens = tokenManager.generateTokens(userModel);
            userModel.accessToken = tokens.jwt;
            userModel.refreshToken = tokens.refresh_token;
            let json = userModel.toJson();
            delete json.id; // Remove the id and the Id is stored in the db as _id

            //Create user in the database
            return this.users.create(json)
                .then((result) => {
                    const tokens = {
                        jwt: result.accessToken,
                        refresh_token: result.refreshToken
                    }
                    resolve(tokens);
                })
                .catch((error) => reject(new UserServiceError(error.message, error)))
        });
    }
    /**
     * Update the users tokens
     * @param  {UserModel} user The user to update 
     * @param  {string} newAccessToken The new access token value
     * @param  {string} newRefreshToken The new refresh token value
     * @return {UserModel} The user with the new tokens
     * @memberof UserService
     */
    updateUserTokens(user, newAccessToken, newRefreshToken) {
        return new Promise((resolve, reject) => {
            return this.users.updateTokens(user.email, newAccessToken, newRefreshToken)
                .then(() => {
                    if (newAccessToken) {
                        user.accessToken = newAccessToken;
                    }
                    if (newRefreshToken) {
                        user.refreshToken = newRefreshToken;
                    }
                    resolve(user);
                })
                .catch(error => reject(new UserServiceError(error.message, error)));
        });
    }
    /**
     * Unsent the access token and refresh token for the user 
     * @param  {UserModel} user The user who will be affected
     * @return {UserModel} The user with the token values unset
     * @memberof UserService
     */
    removeTokens(user) {
        return this.updateUserTokens(user);
    }

    /**
     * Encrypt the password for database storage
     * @param  {sting} password The plain password 
     * @return {sting} The hashed password value
     * @memberof UserService
     */
    encryptPassword(password) {
        return bcrypt.hash(password, 8)
    }
    /**
     * Validate that the stored hashed password is the same as the supplied plain password 
     * @param  {sting} password The plain test password value to be tested
     * @param  {string} hash The encrypted hash password value 
     * @return {boolean} true if it is a match
     * @memberof UserService
     */
    validatePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}

export default UserService;

