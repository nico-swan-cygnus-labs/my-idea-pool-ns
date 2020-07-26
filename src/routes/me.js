'use strict';
/*
 * The Presentation layer for the me API,
 * this also contains the swagger comments for the API documentation /api-docs
 */
import express from 'express';
import authenticate from '../middleware/auth.js';
import UserService from '../services/users/user_service.js';
const meRouter = express.Router();

/**
 * Get user profile details from the current access token
 * @route GET /me
 * @group Current User - Operations.
 * @produces application/json
 * @returns {UserProfileResponse.model} 200 - Success
 * @security JWT
 */
meRouter.get('/', authenticate, (req, res) => {
  const userService = new UserService(req.app.get('db'));
  const profile = userService.getProfile(req.user)
  res.send(profile);
});

export default meRouter;

//Model definitions:
/**
* @typedef UserProfileResponse
* @property {string} email The user's email. - eg: email-4@test.com
* @property {string} name The user's display name. - eg: name-4
* @property {string} avatar_url The user's gravatar profile image url. - eg: https://www.gravatar.com/avatar/b36aafe03e05a85031fd8c411b69f792?d=mm&s=200
*/

