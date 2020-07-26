import mongodb from 'mongodb';
import supertest from 'supertest';
import app from '../../../app.js';
import UserModel from '../../../src/models/user.js';
import Users, { mockUpdateTokens } from '../../../src/persistence/mongodb/users.js';
import { InvalidPassword, UserNotFound } from '../../../src/services/errors/user_service.js';
import TokenManagerService from '../../../src/services/token_manager/token_manager.js';
import UserService, {
    mockUpdateUserTokens,
    mockValidateUserCredentials,
    mockVerifyUserAndToken
} from '../../../src/services/users/user_service.js';

const ObjectID = mongodb.ObjectID;
const request = supertest(app);
const accessTokensUrl = '/access-tokens';
const email = 'test-user@mail.com';
const displayName = 'Test User';
const password = 'SupeSafe@11';

const testUser = {
    /* jshint camelcase: false */
    id: new ObjectID('5f184c04ff4b0383356cb0d5'),
    email: email,
    name: displayName,
    password: password,
    avatar_url: 'https://www.gravatar.com/avatar/9ca892c26434929e4e33c102dd9d743f?d=mm&s=200',
    /* jshint camelcase: true */
};
const users = new Users();
jest.setTimeout(50000);
jest.mock('../../../src/services/users/user_service');
jest.mock('../../../src/persistence/mongodb/users');


const tokenManager = new TokenManagerService();

describe('Access - Sign in', () => {
    let tokens;
    let testUserModel;

    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        tokenManager.jwtExpiresIn = 1;
        mockValidateUserCredentials.mockResolvedValue(testUserModel);
        mockUpdateUserTokens.mockImplementation((user, accessToken, refreshToken) => {
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            return Promise.resolve(user);
        });

        tokens = await tokenManager.generateTokens(testUserModel);
        testUserModel.accessToken = tokens.jwt;
        testUserModel.refreshToken = tokens.refresh_token;
        mockVerifyUserAndToken.mockResolvedValue(testUserModel);
        done();
    })

    afterEach(async (done) => {
        UserService.mockClear();
        jest.clearAllMocks();  //reset mock calls

        testUserModel = new UserModel(testUser);
        tokens = await tokenManager.generateTokens(testUserModel);
        testUserModel.accessToken = tokens.jwt;
        testUserModel.refreshToken = tokens.refresh_token;
        mockVerifyUserAndToken.mockResolvedValue(testUserModel);
        done();
    })

    it('should response status 401 and message contains Wrong password.', async (done) => {
        try {
            const invalidPasswordError = new InvalidPassword();
            mockValidateUserCredentials.mockRejectedValue(invalidPasswordError);
            let response = await request.post(accessTokensUrl)
                .set('Content-Type', 'application/json')
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(401);
            expect(response.body.message).toBe(invalidPasswordError.message)
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should response status 401 and message contains User not found.', async (done) => {
        try {
            let userNotFoundError = new UserNotFound();
            userNotFoundError.status = 401;
            mockValidateUserCredentials.mockRejectedValue(userNotFoundError);
            let response = await request.post(accessTokensUrl)
                .set('Content-Type', 'application/json')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(401)
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should response status 401 and message contains User not found when incorrect username.', async (done) => {
        try {
            let notFoundError = new UserNotFound();
            notFoundError.status = 401;
            mockUpdateTokens.mockRejectedValue(notFoundError);
            let response = await request.post(accessTokensUrl)
                .set('Content-Type', 'application/json')
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should response status 201 when successfully signed in', async (done) => {
        try {
            mockUpdateTokens.mockResolvedValue(testUserModel);
            mockUpdateUserTokens.mockResolvedValue(tokens);
            mockValidateUserCredentials.mockResolvedValue(testUserModel);
            let response = await request.post(accessTokensUrl)
                .set('Content-Type', 'application/json')
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(201);
            expect(response.body).toHaveProperty('jwt');
            expect(response.body).toHaveProperty('refresh_token');
            done();
        } catch (error) {
            done(error);
        }
    });


});