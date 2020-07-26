import { MissingAccessToken, Unauthorized } from '../services/errors/request.js';
import TokenManagerService from '../services/token_manager/token_manager.js';
import UserService from '../services/users/user_service.js';

/**
 * Validate the token before processing the request
 */
const authenticate = async (req, res, next) => {
    try {

        const accessToken = req.header('x-access-token').replace('Bearer', '').trim();
        const tokenManager = new TokenManagerService(req.app.get('db'));
        const userService = new UserService(req.app.get('db'));
        const decoded = tokenManager.verify(accessToken, (req.path == '/refresh'))
        const user = await userService.verifyUserAndToken(decoded.email, accessToken)
            .catch(error => { throw error });

        req.accessToken = accessToken;
        req.user = user;
        next();

    } catch (error) {
        if (!req.header('x-access-token')) {
            error = new MissingAccessToken();
        }
        next(new Unauthorized(error.message, error));
    }
}

export default authenticate;

