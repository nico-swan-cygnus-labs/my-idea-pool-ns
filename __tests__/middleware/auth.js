'use strict';
import supertest from 'supertest';
import app from '../../app.js';
import UserModel from '../../src/models/user.js';
import { UserNotFound } from '../../src/services/errors/user_service.js';
import TokenManagerService from '../../src/services/token_manager/token_manager.js';
import UserService, {
    mockGetProfile, mockUpdateUserTokens,
    mockValidateUserCredentials,
    mockVerifyUserAndToken
} from '../../src/services/users/user_service.js';


const request = supertest(app);
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
    tokens: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZCI6ImI1ZjNlZWVjLTgwNzUtNGNlNC04NzUxLWQ0YmIzZTY2ZTk4MyJ9.IOTjiSekbXnSXJJaAuJ3KtfSwNXEoNm0PXKcjP2hnbM', /* cspell:disable-line */
        refresh_token: 'YjVmM2VlZWMtODA3NS00Y2U0LTg3NTEtZDRiYjNlNjZlOTgzOjE2MjY2MzExODc='
    }
    /* jshint camelcase: true */
};
let testUserModel = new UserModel(testUser);
const tokenManager = new TokenManagerService();

jest.mock('../../src/services/users/user_service');

describe('Authentication', () => {
    let tokens;
    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        tokenManager.jwtExpiresIn = 1;
        mockValidateUserCredentials.mockResolvedValue();
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

    beforeEach(async (done) => {
        // Clear all instances and calls to constructor and all methods:
        UserService.mockClear();
        jest.clearAllMocks();  //reset mock calls
        testUserModel = new UserModel(testUser);
        tokens = await tokenManager.generateTokens(testUserModel);
        testUserModel.accessToken = tokens.jwt;
        testUserModel.refreshToken = tokens.refresh_token;
        mockVerifyUserAndToken.mockResolvedValue(testUserModel);
        done();
    });

    it('should return a user in the request when authenticated', async (done) => {

        mockGetProfile.mockImplementation((user) => {
            return {
                email: user.email,
                name: user.name,
                avatar_url: user.avatarUrl
            };
        });

        try {
            let result = await request.get('/me')
                .set('x-access-token', 'Bearer ' + tokens.jwt)
                .send()
                .expect(200)
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should return 401 if user not found', async (done) => {
        try {
            mockVerifyUserAndToken.mockRejectedValue(new UserNotFound())
            let result = await request.get('/me')
                .set('x-access-token', 'Bearer ' + tokens.jwt)
                .send()
                .expect(401)
                .then(response => {
                    expect(response.body.type).toBe('Authentication');
                    expect(response.body.message).toBe('Please authenticate! : User not found');
                    done();
                })
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should return 401 when no token is provided.', async (done) => {
        try {
            let result = await request.get('/me')
                .send()
                .expect(401)
                .then(response => {
                    expect(response.body.type).toBe('Authentication');
                    expect(response.body.message).toBe('Please authenticate! : Missing access token, please provide');
                    done();
                })
            done();
        } catch (error) {
            done(error);
        }
    });


});