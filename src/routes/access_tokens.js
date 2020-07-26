'use strict';
/*
 * The Presentation layer for the access token API,
 * this also contains the swagger comments for the API documentation /api-docs
 */
import expressPromiseRouter from 'express-promise-router';
import authenticate from '../middleware/auth.js';
import TokenManagerService from '../services/token_manager/token_manager.js';
import UserService from '../services/users/user_service.js';
import { validateRequired } from '../services/validators/requests.js';

const accessTokensRouter = expressPromiseRouter();

/**
 * Sign in user. Generate a new access token with provided credentials.
 * @route POST /access-tokens
 * @group Access Token - Operations for login and access token management.
 * @param {AccessTokenLoginRequest.model} request.body - The user's email address and password
 * @produces application/json
 * @consumes application/json
 * @returns {AccessTokenResponse} 200 - The new JWT token
 * @returns {Error}  default - Unexpected error
 */
accessTokensRouter.post('/', async (req, res, next) => {
  const userService = new UserService(req.app.get('db'));
  const tokenManager = new TokenManagerService(req.app.get('db'));
  // Validate required properties
  const requireProperties = ['email', 'password'];
  await validateRequired(req, requireProperties)
    // Validate user
    .then(() => userService.validateUserCredentials(req.body.email, req.body.password))
    // Generate and update user tokens
    .then(user => tokenManager.create(user))
    .then(accessToken => res.status(201).send(accessToken))
    // Send failure error
    .catch(error => next(error));
});

/**
 * Refresh the access token for a user. 
 * Tokens are sort lived and need to be refreshed often for security reasons.
 * This security process flow should be executed in the background by the application
 * if a valid token is given.
 * @route POST /access-tokens/refresh
 * @group Access Token - Operations for login and access token management.
 * @param {AccessTokenRefreshRequest.model} request.body - The user refresh token provided with the JWT access token.
 * @produces application/json
 * @consumes application/json
 * @returns {AccessTokenResponse} 200 - The new JWT token
 * @returns {Error}  default - Unexpected error
 */
accessTokensRouter.post('/refresh', authenticate, async (req, res, next) => {
  const tokenManager = new TokenManagerService(req.app.get('db'));
  // Validate required properties
  const requireProperties = ['refresh_token'];
  await validateRequired(req, requireProperties)
    // Call the token manager to refresh the access token
    .then(() => tokenManager.refresh(req.user, req.body.refresh_token))
    .then(newTokens => res.status(200).send({ jwt: newTokens.jwt }))
    // Send failure error
    .catch(next);
})
/**
 * Logout current user.
 * @route DELETE /access-tokens
 * @group Access Token - Operations for login and access token management.
 * @param {AccessTokenRefreshRequest.model} request.body - The user refresh token provided with the JWT access token.
 * @consumes application/json
 * @returns {none} 204 - Success remove of JWT token
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
accessTokensRouter.delete('/', authenticate, async (req, res, next) => {
  const tokenManager = new TokenManagerService(req.app.get('db'));
  const requireProperties = ['refresh_token'];
  await validateRequired(req, requireProperties)
    // Call the token manager to remove tokens 
    .then(() => tokenManager.delete(req.user, req.body.refresh_token))
    .then(() => res.status(204).send())
    // Send failure error
    .catch(next);
});

export default accessTokensRouter;

//Model definitions:
/* cspell: disable */
/**
* @typedef AccessTokenResponse
* @property {string} jwt.required The valid JWT token for the user. - eg: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE1NTM2NTg1MjYsImlkIjoidGcyYjlrbzNuIiwiZW1haWwiOiJlbWFpbC0zQHRlc3QuY29tIiwibmFtZSI6Im5hbWUtMyJ9.ywtNfm8wroPwqBqkmxfTWcYu-vMdbA6wi-x6IkxBT9HdZHFMm2idvXnMFiaeR4e-xio2cN0UdWqT8w9rctod8DuotextP1a_kWsqe7HlBdgyWMrentORgKNxtf9ORS40NDBH9LkJpoT_4StlFwuX4lN5dTPBOt042cpykoG53VO6ue668RzdRlKuj71L6Fx66aRLRJy-csnm9rTsW2kbwTShNbbEBzCYbOSvk0q5bm4ei6HfCJejb0PqV1Wi2dI06NomPUohoWmSjncdCWEihKdaJaNKl7aS5pUU5qvU-y2UtC0WnL0fmzrOoCS2VxQXvheJoyAU7KjcXVp1OY7nKqJ1kXod6Fx9JwdG-BLl_H34Shlx0S6ySi95tuB3MIoft2iXTZAlvzEKdIWAiYD8cjKHdnJF6wFE8QUOB0xbEA92gOOqp9yznp6pHbPmzpDQBsHyV292MMkctTycfMHRmbrL63M1Kfk0qpJrhgmB5szBYfUDpLXSVDaV2IQZXSPYuwzlc-ZJeqOrTD729qxSlg9HDqIPAzkBThUqTAJypxGS2LQ2x6eF19CU0efmZ3y-FGFxcsCWduPM8_oG9CR8cB6g8g05gcB8bZsCLITOuzy0vHpwAV2Z8lvWNTLKxiivayxybrAq85VOkDsH4EbedmAvnE5NbRt7gMKnTUmUX14
* @property {string} refresh_token.required The refresh token - eg: c9e30dae5fcb92a02a01545c73ce5bc4f42b6a23b15facd36fd3fa4dbca9b30d1f220268008b414aaa1e09b011e718e305d9
*/

/**
* @typedef RefreshTokenResponse
* @property {string} jwt.required The valid JWT token for the user. - eg: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE1NTM2NTg1MjYsImlkIjoidGcyYjlrbzNuIiwiZW1haWwiOiJlbWFpbC0zQHRlc3QuY29tIiwibmFtZSI6Im5hbWUtMyJ9.ywtNfm8wroPwqBqkmxfTWcYu-vMdbA6wi-x6IkxBT9HdZHFMm2idvXnMFiaeR4e-xio2cN0UdWqT8w9rctod8DuotextP1a_kWsqe7HlBdgyWMrentORgKNxtf9ORS40NDBH9LkJpoT_4StlFwuX4lN5dTPBOt042cpykoG53VO6ue668RzdRlKuj71L6Fx66aRLRJy-csnm9rTsW2kbwTShNbbEBzCYbOSvk0q5bm4ei6HfCJejb0PqV1Wi2dI06NomPUohoWmSjncdCWEihKdaJaNKl7aS5pUU5qvU-y2UtC0WnL0fmzrOoCS2VxQXvheJoyAU7KjcXVp1OY7nKqJ1kXod6Fx9JwdG-BLl_H34Shlx0S6ySi95tuB3MIoft2iXTZAlvzEKdIWAiYD8cjKHdnJF6wFE8QUOB0xbEA92gOOqp9yznp6pHbPmzpDQBsHyV292MMkctTycfMHRmbrL63M1Kfk0qpJrhgmB5szBYfUDpLXSVDaV2IQZXSPYuwzlc-ZJeqOrTD729qxSlg9HDqIPAzkBThUqTAJypxGS2LQ2x6eF19CU0efmZ3y-FGFxcsCWduPM8_oG9CR8cB6g8g05gcB8bZsCLITOuzy0vHpwAV2Z8lvWNTLKxiivayxybrAq85VOkDsH4EbedmAvnE5NbRt7gMKnTUmUX14
*/

/**
 * @typedef AccessTokenLoginRequest
 * @property {string} email.required The user's email address as the username. - eg : email-1@test.com
 * @property {string} password.required The user's password. - eg : the-Secret-123
 */

/**
* @typedef AccessTokenRefreshRequest
* @property {string} refresh_token.required The refresh JWT token for the user. - eg: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE1NTM2NTg1MjYsImlkIjoidGcyYjlrbzNuIiwiZW1haWwiOiJlbWFpbC0zQHRlc3QuY29tIiwibmFtZSI6Im5hbWUtMyJ9.ywtNfm8wroPwqBqkmxfTWcYu-vMdbA6wi-x6IkxBT9HdZHFMm2idvXnMFiaeR4e-xio2cN0UdWqT8w9rctod8DuotextP1a_kWsqe7HlBdgyWMrentORgKNxtf9ORS40NDBH9LkJpoT_4StlFwuX4lN5dTPBOt042cpykoG53VO6ue668RzdRlKuj71L6Fx66aRLRJy-csnm9rTsW2kbwTShNbbEBzCYbOSvk0q5bm4ei6HfCJejb0PqV1Wi2dI06NomPUohoWmSjncdCWEihKdaJaNKl7aS5pUU5qvU-y2UtC0WnL0fmzrOoCS2VxQXvheJoyAU7KjcXVp1OY7nKqJ1kXod6Fx9JwdG-BLl_H34Shlx0S6ySi95tuB3MIoft2iXTZAlvzEKdIWAiYD8cjKHdnJF6wFE8QUOB0xbEA92gOOqp9yznp6pHbPmzpDQBsHyV292MMkctTycfMHRmbrL63M1Kfk0qpJrhgmB5szBYfUDpLXSVDaV2IQZXSPYuwzlc-ZJeqOrTD729qxSlg9HDqIPAzkBThUqTAJypxGS2LQ2x6eF19CU0efmZ3y-FGFxcsCWduPM8_oG9CR8cB6g8g05gcB8bZsCLITOuzy0vHpwAV2Z8lvWNTLKxiivayxybrAq85VOkDsH4EbedmAvnE5NbRt7gMKnTUmUX14
*/

/* cspell: disable */


