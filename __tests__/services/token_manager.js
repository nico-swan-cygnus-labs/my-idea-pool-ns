
import _ from 'lodash';
import { v1 as uuidV1 } from 'uuid';
import UserModel from '../../src/models/user.js';
import Users, { mockUpdateTokens } from '../../src/persistence/mongodb/users.js';
import { NotFound } from '../../src/services/errors/database.js';
import {
    MalformedAccessToken,
    RefreshTokenExpired,
    RefreshTokenMismatch,
    TokenExpired,
    TokenManagerError,
    UserNotFound
} from '../../src/services/errors/token_manager.js';
import TokenManagerService from '../../src/services/token_manager/token_manager.js';
// mockCreate,
// mockFindOneByEmail,
// mockFindOne,
// mockUpdateTokens,
// mockDelete,
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

jest.setTimeout(50000);
jest.mock('../../src/persistence/mongodb/users');

describe('Tokens Manager Service - Verify', () => {
    let tokens;
    let testUserModel;
    let tokenManager;
    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        done();
    })

    beforeEach(async (done) => {
        Users.mockClear();
        jest.clearAllMocks();  //reset mock calls
        tokenManager = new TokenManagerService();
        done();
    })

    it('should verify user token with a normal request and return ', (done) => {
        try {
            let tokens = tokenManager.generateTokens(testUserModel);
            let result = tokenManager.verify(tokens.jwt);
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('exp');
            expect(result).toHaveProperty('iat');
            expect(result).toHaveProperty('name');
            done();
        } catch (error) {
            done(error);
        }
    });
    it('should verify user token with a refresh request and return ', async (done) => {
        try {
            let tokens = tokenManager.generateTokens(testUserModel, true);
            let result = tokenManager.verify(tokens.jwt);
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('exp');
            expect(result).toHaveProperty('iat');
            expect(result).toHaveProperty('name');
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to verify user token when secret is different ', (done) => {
        try {
            const tokenMngOther = _.cloneDeep(tokenManager);
            tokenMngOther.secretKey = 'different';
            const tokens = tokenMngOther.generateTokens(testUserModel);
            expect(() => { tokenManager.verify(tokens.jwt) }).toThrow(TokenManagerError);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail verify when access token is malformed', async (done) => {
        try {
            expect(() => {
                tokenManager.verify('MalformedJWTToken');
            }).toThrow(new MalformedAccessToken())
            done();
        } catch (error) {
            done(error);
        }
    });
    it('should fail verify when access token is expired.', async (done) => {
        try {
            tokenManager.jwtExpiresIn = 1;
            let tokens = tokenManager.generateTokens(testUserModel);
            setTimeout(() => {
                expect(() => {
                    tokenManager.verify(tokens.jwt);
                }).toThrow(new TokenExpired())
                done();
            }, 1000)

        } catch (error) {
            done(error);
        }
    });
    it('should not fail verify when access token is expired and the is a refresh request', async (done) => {
        try {
            tokenManager.jwtExpiresIn = 1;
            let tokens = tokenManager.generateTokens(testUserModel);
            setTimeout(() => {
                expect(() => {
                    tokenManager.verify(tokens.jwt, true);
                }).not.toThrow()
                done();
            }, 1000)
        } catch (error) {
            done(error);
        }
    });

});


describe('Tokens Manager Service - Create', () => {
    let tokens;
    let testUserModel;
    let tokenManager;
    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        done();
    })

    beforeEach(async (done) => {
        tokenManager = new TokenManagerService();
        done();
    })

    afterEach(async (done) => {
        Users.mockClear();
        jest.clearAllMocks();  //reset mock calls
        done();
    })

    it('should create token for a user', async (done) => {
        try {
            mockUpdateTokens.mockResolvedValue();
            let result = await tokenManager.create(testUser);
            expect(result).toHaveProperty('jwt');
            expect(result).toHaveProperty('refresh_token');
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to create token when user is not found', async (done) => {
        try {
            mockUpdateTokens.mockRejectedValue(new NotFound());
            await expect(tokenManager.create(testUser)).rejects.toThrow(new UserNotFound())
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to create token when user is not found', async (done) => {
        try {
            mockUpdateTokens.mockRejectedValue(new Error('SomeError'));
            await expect(tokenManager.create(testUser)).rejects.toThrow(new TokenManagerError('SomeError'))
            done();
        } catch (error) {
            done(error);
        }
    });

});

describe('Tokens Manager Service - Refresh', () => {
    let tokens;
    let testUserModel;
    let tokenManager;
    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        done();
    })

    beforeEach(async (done) => {
        tokenManager = new TokenManagerService();
        done();
    })

    afterEach(async (done) => {
        Users.mockClear();
        jest.clearAllMocks();  //reset mock calls
        done();
    })

    it('should generate a new access token when the exiting token has not expired', async (done) => {
        try {
            tokenManager.jwtExpiresIn = 1;
            mockUpdateTokens.mockResolvedValue();
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = tokens.refresh_token;
            setTimeout(async () => {
                let result = await tokenManager.refresh(testUser, testUser.refreshToken);
                expect(result).toHaveProperty('jwt');
                expect(result.jwt).not.toBe(tokens.accessToken);
                done();
            }, 1000)
        } catch (error) {
            done(error);
        }
    });

    it('should generate a new access token when the exiting token has not expired', async (done) => {
        try {
            tokenManager.jwtExpiresIn = 1;
            mockUpdateTokens.mockResolvedValue();
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = tokens.refresh_token;
            setTimeout(async () => {
                let result = await tokenManager.create(testUser, testUser.refreshToken);
                expect(result).toHaveProperty('jwt');
                expect(result.jwt).not.toBe(tokens.accessToken);
                done();
            }, 1000)
        } catch (error) {
            done(error);
        }
    });

    it('should delete tokens for a user', async (done) => {
        try {
            mockUpdateTokens.mockResolvedValue();
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = tokens.refresh_token;
            await expect(tokenManager.delete(testUser, testUser.refreshToken)).resolves;
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to delete tokens for a user when token mismatched', async (done) => {
        try {
            mockUpdateTokens.mockResolvedValue();
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = tokens.refresh_token;
            await expect(tokenManager.delete(testUser, 'Mismatched'))
                .rejects.toThrow(RefreshTokenMismatch);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to delete tokens for a user when user update fail', async (done) => {
        try {
            mockUpdateTokens.mockRejectedValue(new Error('Test'));
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = tokens.refresh_token;
            await expect(tokenManager.delete(testUser, testUser.refreshToken))
                .rejects.toThrow(TokenManagerError);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to delete tokens for a user when token expired', async (done) => {
        try {
            const dateNow = new Date().getTime();
            const milSecToExpireOn = 60 * 60 * 1 * 1000;
            const expireTime = dateNow - milSecToExpireOn; //Epoch timestamp
            const buff = new Buffer.from(`${uuidV1()}:${expireTime}`);
            const expiredRefreshToken = buff.toString('base64');

            mockUpdateTokens.mockResolvedValue();
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = expiredRefreshToken;
            await expect(tokenManager.delete(testUser, expiredRefreshToken))
                .rejects.toThrow(RefreshTokenExpired);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail to refresh token when user is not found', async (done) => {
        try {
            mockUpdateTokens.mockRejectedValue(new NotFound());
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = tokens.refresh_token;
            await expect(tokenManager.refresh(testUser, testUser.refreshToken)).rejects.toThrow(new UserNotFound())
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail with a TokenManagerError for any other error', async (done) => {
        try {
            mockUpdateTokens.mockRejectedValue(new Error('SomeError'));
            let tokens = tokenManager.generateTokens(testUserModel);
            testUser.accessToken = tokens.jwt;
            testUser.refreshToken = tokens.refresh_token;
            await expect(tokenManager.refresh(testUser, testUser.refreshToken)).rejects.toThrow(new TokenManagerError('SomeError'))
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should fail validating refresh token when null is passed to function', (done) => {
        try {
            expect(() => { tokenManager._hasRefreshTokenExpired() }).toThrow(TokenManagerError)
            done();
        } catch (error) {
            done(error);
        }
    });

});