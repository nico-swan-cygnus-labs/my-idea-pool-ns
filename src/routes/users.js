'use strict';
/*
 * The Presentation layer for the user API, 
 * this also contains the swagger comments for the API documentation /api-docs
 */
import express from 'express';
import UserService from '../services/users/user_service.js';
import { validateRequired } from '../services/validators/requests.js';

const usersRouter = express.Router();

/**
 * Sign up a user.
 * @route POST /users
 * @group Users - Operations for managing users.
 * @param {UserRequest.model} request.body - The new user detail
 * @produces application/json
 * @consumes application/json
 * @returns {AccessTokenResponse.model} 200 - The newly added user's access_token
 * @returns {UsersError.model} 400 - Bad request
 * @security JWT
 */
usersRouter.post('/', async (req, res, next) => {
  return new Promise((resolve, reject) => {
    const userService = new UserService(req.app.get('db'));
    // Validate required properties
    const requireProperties = ['name', 'password', 'email'];
    return validateRequired(req, requireProperties)
      .then(() => userService.signUp(req.body.email, req.body.name, req.body.password))
      .then(accessToken => resolve(res.status(201).send(accessToken)))
      .catch(error => next(error));
  });
});

export default usersRouter;

//Model definitions:
/**
* @typedef UserRequest
* @property {string} email.required The email address of the user. - eg: jack-black@codementor.io
* @property {string} name.required The full display name for the user. - eg: Jack Black
* @property {string} password.required Password (at least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 number). - eg: the-Secret-123
*/

/**
* @typedef UsersError
* @property {enum} error_type.required Indicate the error category. - eg: Invalid Password, Weak Password, Invalid Email Address
* @property {string} error.required The error description. - eg: This is an error
*/
