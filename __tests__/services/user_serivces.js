import _ from 'lodash';
import UserModel from '../../src/models/user.js';
import Users, { mockCreate, mockFindOneByEmail, mockUpdateTokens } from '../../src/persistence/mongodb/users.js';
import { NotFound } from '../../src/services/errors/database.js';
import { TokenMismatch } from '../../src/services/errors/token_manager.js';
import { InvalidPassword, UserLoggedOut, UserServiceError } from '../../src/services/errors/user_service.js';
import TokenManagerService from '../../src/services/token_manager/token_manager.js';
import UserService from '../../src/services/users/user_service.js';
const tokenManager = new TokenManagerService();
const userService = new UserService();

const testUser = {
    /* jshint camelcase: false */
    email: 'test@test-email.com',
    name: 'Test User',
    password: 'TestP@ss#1',
    avatar_url: 'https://test-url-com'
    /* jshint camelcase: true */
}

let testUserModel;
jest.setTimeout(50000);
jest.mock('../../src/persistence/mongodb/users');

describe('Service - User', () => {

    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        let tokens = await tokenManager.generateTokens(testUserModel);
        testUserModel.accessToken = tokens.jwt;
        testUserModel.refreshToken = tokens.refresh_token;
        done();
    })

    beforeEach((done) => {
        testUserModel = new UserModel(testUser);
        Users.mockClear();
        jest.clearAllMocks();  //reset mock calls
        done();
    })

    it('should get user profile', (done) => {
        try {
            let result = userService.getProfile(testUserModel);
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('avatar_url');
            done();
        } catch (error) {
            done(error);
        }
    });


    it('should sign up user with an encrypted password', async (done) => {
        try {
            mockCreate.mockResolvedValue(testUserModel);
            let result = await userService.signUp(testUser.email, testUser.name, testUser.password);
            expect(result).toHaveProperty('jwt');
            expect(result).toHaveProperty('refresh_token');
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should throw error when some error occurred creating user', async (done) => {
        try {
            mockCreate.mockRejectedValue(new Error('Test'));
            await expect(userService.signUp(testUser.email, testUser.name, testUser.password))
                .rejects.toThrow(UserServiceError);
            done();
        } catch (error) {
            done(error);
        }
    });


    it('should verify user access tokens', async (done) => {
        try {
            const loggedInUser = _.cloneDeep(testUserModel);
            let tokens = await tokenManager.generateTokens(testUserModel);
            loggedInUser.accessToken = tokens.jwt;
            loggedInUser.refreshToken = tokens.refresh_token;
            mockFindOneByEmail.mockResolvedValue(loggedInUser);
            let result = await userService.verifyUserAndToken(loggedInUser.email, loggedInUser.accessToken);
            expect(result).toBe(loggedInUser);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail when user tokens mismatch', async (done) => {
        try {
            const loggedInUser = _.cloneDeep(testUserModel);
            let tokens = await tokenManager.generateTokens(testUserModel);
            loggedInUser.accessToken = tokens.jwt;
            loggedInUser.refreshToken = tokens.refresh_token;
            mockFindOneByEmail.mockResolvedValue(loggedInUser);
            await expect(userService.verifyUserAndToken(loggedInUser.email, 'TokenMismatch'))
                .rejects.toThrow(TokenMismatch);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should verify user is logged out', async (done) => {
        try {
            mockFindOneByEmail.mockResolvedValue(testUserModel);
            await expect(userService.verifyUserAndToken(testUserModel.email, testUserModel.accessToken)).rejects.toThrow(UserLoggedOut);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should throw error when some error occurred ', async (done) => {
        try {
            mockFindOneByEmail.mockRejectedValue(new Error('Test'));
            await expect(userService.verifyUserAndToken(testUserModel.email, testUserModel.accessToken)).rejects.toThrow(UserServiceError);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should validate user\'s credentials', async (done) => {
        try {
            const UserPassword = testUserModel.password;
            testUserModel.password = await userService.encryptPassword(UserPassword);
            mockFindOneByEmail.mockResolvedValue(testUserModel);
            let result = await userService.validateUserCredentials(testUserModel.email, UserPassword);
            expect(result).toBe(testUserModel);
            done();
        } catch (error) {
            done(error);
        }

    });

    it('should fail validate user\'s credentials when password not matching', async (done) => {
        try {
            mockFindOneByEmail.mockResolvedValue(testUserModel);
            await expect(userService.validateUserCredentials(testUserModel.email, 'notMatching'))
                .rejects.toThrow(InvalidPassword);
            done();
        } catch (error) {
            done(error);
        }

    });

    it('should fail to validate user\'s credentials when email not found', async (done) => {
        try {

            mockFindOneByEmail.mockRejectedValue(new NotFound());
            await expect(userService.validateUserCredentials('fakeemail', testUser.password)).rejects.toThrow(UserServiceError);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should update tokens with new values', async (done) => {
        try {
            let tokens = await tokenManager.generateTokens(testUserModel);
            mockFindOneByEmail.mockResolvedValue(testUserModel);
            mockUpdateTokens.mockResolvedValue();
            let result = await userService.updateUserTokens(testUserModel, tokens.jwt, tokens.refresh_token);
            expect(result.accessToken).toBe(tokens.jwt);
            expect(result.refreshToken).toBe(tokens.refresh_token);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to update tokens when error updating user', async (done) => {
        try {
            let tokens = await tokenManager.generateTokens(testUserModel);
            mockFindOneByEmail.mockResolvedValue(testUserModel);
            mockUpdateTokens.mockRejectedValue(new Error());
            await expect(userService.updateUserTokens(testUserModel, tokens.jwt, tokens.refresh_token))
                .rejects.toThrow(UserServiceError);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should remove tokens from user', async (done) => {
        try {
            let tokens = await tokenManager.generateTokens(testUserModel);
            mockFindOneByEmail.mockResolvedValue(testUserModel);
            mockUpdateTokens.mockResolvedValue();

            let result = await userService.removeTokens(testUserModel);
            expect(result.accessToken).toBeUndefined()
            expect(result.refreshToken).toBeUndefined();

            done();
        } catch (error) {
            done(error);
        }
    });


});