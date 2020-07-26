
import cookieParser from 'cookie-parser';
import express from 'express';
import requestId from 'express-request-id';
import helmet from 'helmet';
import { default as logger } from 'morgan';
import noCache from 'nocache'; /* cspell: disable-line */
import path from 'path';
import responseTime from 'response-time';
import accessTokensRouter from './src/routes/access_tokens.js';
import ideasRouter from './src/routes/ideas.js';
/**
 * Configure routes
 */
import indexRouter from './src/routes/index.js';
import meRouter from './src/routes/me.js';
import usersRouter from './src/routes/users.js';
import BaseError from './src/services/errors/error.js';
import { InternalServerError } from './src/services/errors/request.js';





// Application
let app = express();
let addRequestId = requestId();
app.use(addRequestId);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'))
app.use(responseTime());

// Add security
app.use(helmet());
app.disable('x-powered-by');

/**
 * Configure Swagger API Documentation
 */

const options = {
    swaggerDefinition: {
        info: {
            description: 'My Idea Pool',
            title: 'Swagger',
            version: '1.0.0',
        },
        basePath: '/',
        produces: [
            'application/json'
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'X-Access-Token',
                description: 'The access token generated from the user login.',
            }
        }
    },
    basedir: path.resolve(), //app absolute path
    files: ['./src/routes/**/*.js', './src/models/**/*.js'] //Path to the API handle folder
};
//expressSwagger(app)(options);
app.set('swaggerOptions', options);

// Set standard headers
app.all('*', function (req, res, next) {

    if (req.method !== 'DELETE') {
        res.set({ 'Cache-Control': 'max-age=0, private, must-revalidate' });
    } else {
        noCache();
    }
    if (Boolean(req.header('x-debug-show-stack-trace'))) {
        req.xDebugShowStackTrace = true;
    } else {
        req.xDebugShowStackTrace = false;
    }
    res.vary('Accept-Encoding, Origin');
    //res.type('application/json');
    next();

});

/** 
 * Define root endpoints 
*/
app.use('/', indexRouter);
app.use('/me', meRouter);
app.use('/users', usersRouter);
app.use('/ideas', ideasRouter);
app.use('/access-tokens', accessTokensRouter);

/**
 * Error Handling
*/
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    if (!(err instanceof BaseError)) {
        err = new InternalServerError(err.message, req, err); // This is by default an Internal server Error
    }
    res.status(err.status).send(err.toJson(req.xDebugShowStackTrace));
}
app.use(errorHandler);

export default app;
