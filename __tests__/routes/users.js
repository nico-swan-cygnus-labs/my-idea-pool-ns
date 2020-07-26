'use strict';
import supertest from 'supertest';
import app from '../../app.js';
import UserModel from '../../src/models/user.js';
import {
    //InvalidPassword, 
    UserExists
    //UserNotFound, 
    //UserServiceError
} from '../../src/services/errors/user_service.js';
import TokenManagerService from '../../src/services/token_manager/token_manager.js';
import UserService, {
    mockSignUp,
    mockUpdateUserTokens,
    mockValidateUserCredentials,
    mockVerifyUserAndToken
} from '../../src/services/users/user_service.js';
const userService = new UserService();

const request = supertest(app);
const usersUrl = '/users';
const email = 'test@test-email.com';
const displayName = 'Test User';
const password = 'TestP@ss#1';
const testUser = {
    /* jshint camelcase: false */
    email: email,
    name: displayName,
    password: password,
    avatar_url: 'https://test-url-com'
    /* jshint camelcase: true */
}
let testUserModel;

jest.setTimeout(50000);
jest.mock('../../src/services/users/user_service');

describe('Access - Sign up', () => {
    let tokens;

    beforeAll(async (done) => {
        const tokenManager = new TokenManagerService();
        testUserModel = new UserModel(testUser);
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

    beforeEach((done) => {
        UserService.mockClear();
        jest.clearAllMocks();  //reset mock calls
        done();
    });

    it('should response status 400 when property missing', (done) => {
        request.post(usersUrl)
            .set('Content-Type', 'application/json')
            .send({})
            .expect(400)
            .end((err) => {
                done(err);
            });
    });

    it('should response status 200 when sign up', async (done) => {
        try {

            mockValidateUserCredentials.mockResolvedValue(testUserModel.toJson());
            mockUpdateUserTokens.mockResolvedValue(tokens);
            mockSignUp.mockResolvedValue({
                jwt: tokens.jwt,
                refresh_token: tokens.refresh_token
            });
            let response = await request.post(usersUrl)
                .set('Content-Type', 'application/json')
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    email: email,
                    name: displayName,
                    password: password,
                });
            expect(response.body).toHaveProperty('jwt');
            expect(response.body).toHaveProperty('refresh_token');
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should response status 400 and when sign up exist user', async (done) => {
        try {
            const userExistError = new UserExists();
            mockSignUp.mockRejectedValue(userExistError);
            let response = await request.post(usersUrl)
                .set('Content-Type', 'application/json')
                .send({
                    email: email,
                    name: displayName,
                    password: password,
                })
                .expect(400)
            expect(response.body.message).toBe(userExistError.message);
            done();
        } catch (error) {
            done(error);
        }
    });
});
