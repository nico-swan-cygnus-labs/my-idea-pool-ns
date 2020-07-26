import supertest from 'supertest';
import app from '../../../app.js';
import UserModel from '../../../src/models/user.js';
import Users, { mockUpdateTokens } from '../../../src/persistence/mongodb/users.js';
import { NotFound } from '../../../src/services/errors/database.js';
import { RefreshTokenExpired, RefreshTokenMismatch, UserNotFound } from '../../../src/services/errors/token_manager.js';
import TokenManagerService from '../../../src/services/token_manager/token_manager.js';
import UserService, {
    mockUpdateUserTokens,
    mockValidateUserCredentials,
    mockVerifyUserAndToken
} from '../../../src/services/users/user_service.js';

const request = supertest(app);
const accessTokensUrl = '/access-tokens';
const email = 'test-user@mail.com';
const displayName = 'Test User';
const password = 'SupeSafe@11';

const testUser = {
    /* jshint camelcase: false */
    id: '1',
    email: email,
    name: displayName,
    password: password,
    avatar_url: 'https://www.gravatar.com/avatar/9ca892c26434929e4e33c102dd9d743f?d=mm&s=200',
    /* jshint camelcase: true */
};
const tokenManager = new TokenManagerService();
const users = new Users();

jest.setTimeout(50000);
jest.mock('../../../src/services/users/user_service');
jest.mock('../../../src/persistence/mongodb/users');

describe('Access - Refresh', () => {
    let tokens;
    let testUserModel;

    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        tokenManager.jwtExpiresIn = 1;
        mockValidateUserCredentials.mockResolvedValue();
        mockUpdateUserTokens.mockImplementation((user, accessToken, refreshToken) => {
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            return Promise.resolve(user);
        });

        done();
    })

    beforeEach(async (done) => {
        testUserModel = new UserModel(testUser);
        tokens = await tokenManager.generateTokens(testUserModel);
        testUserModel.accessToken = tokens.jwt;
        testUserModel.refreshToken = tokens.refresh_token;
        mockVerifyUserAndToken.mockResolvedValue(testUserModel);

        done();
    })

    afterEach(async (done) => {
        UserService.mockClear();
        Users.mockClear();
        jest.clearAllMocks();  //reset mock calls
        done();
    })

    it('should response 200 when successfully refreshed token.', async (done) => {
        try {
            mockValidateUserCredentials.mockResolvedValue();
            mockUpdateTokens.mockResolvedValue(testUserModel);
            setTimeout(async () => {
                let response = await request.post(`${accessTokensUrl}/refresh`)
                    .set('Content-Type', 'application/json')
                    .set('x-access-token', 'Bearer ' + testUserModel.accessToken)
                    .send({
                        refresh_token: testUserModel.refreshToken
                    })
                    .expect(200);
                expect(response.body).toHaveProperty('jwt');
                expect(response.body).not.toHaveProperty('refresh_token');
                expect(response.body.jwt).not.toBe(tokens.jwt);
                done();
            }, 1000);
        } catch (error) {
            done(error);
        }
    });

    it('should response 401 when user update fails with new tokens.', async (done) => {
        try {
            mockUpdateTokens.mockRejectedValue(new NotFound());
            let response = await request.post(`${accessTokensUrl}/refresh`)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'Bearer ' + tokens.jwt)
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    refresh_token: tokens.refresh_token
                })
                .expect(401);
            expect(response.body.message).toBe(new UserNotFound().message);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should response 401 when refresh token has expired.', async (done) => {
        try {
            tokenManager.refreshExpiresIn = -1;
            const expiredTokens = await tokenManager.generateTokens(testUserModel);
            testUserModel.accessToken = expiredTokens.jwt;
            testUserModel.refreshToken = expiredTokens.refresh_token;
            mockVerifyUserAndToken.mockResolvedValue(testUserModel);

            setTimeout(async () => {
                let response = await request.post(`${accessTokensUrl}/refresh`)
                    .set('Content-Type', 'application/json')
                    .set('x-access-token', 'Bearer ' + expiredTokens.jwt)
                    .set('x-debug-show-stack-trace', 'true')
                    .send({
                        refresh_token: expiredTokens.refresh_token
                    })
                    .expect(401);
                expect(response.body.message).toBe(new RefreshTokenExpired().message);
                done();
            }, 1000);

        } catch (error) {
            done(error);
        }
    });



    it('should response 400 when refresh token doesn\'t match what is stored.', async (done) => {
        try {
            let response = await request.post(`${accessTokensUrl}/refresh`)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'Bearer ' + tokens.jwt)
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    refresh_token: 'NotMatching'
                })
            expect(400);
            expect(response.body.message).toBe(new RefreshTokenMismatch().message)
            done();
        } catch (error) {
            done(error);
        }
    });
});