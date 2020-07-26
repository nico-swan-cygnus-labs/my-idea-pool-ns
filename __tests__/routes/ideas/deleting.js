import mongodb from 'mongodb';
import supertest from 'supertest';
import app from '../../../app.js';
import IdeaModel from '../../../src/models/idea.js';
import UserModel from '../../../src/models/user.js';
import IdeaService, { mockDeleteIdea } from '../../../src/services/ideas/idea.js';
import TokenManagerService from '../../../src/services/token_manager/token_manager.js';
import UserService, {
    mockUpdateUserTokens,
    mockValidateUserCredentials,
    mockVerifyUserAndToken
} from '../../../src/services/users/user_service.js';
const ObjectID = mongodb.ObjectID;

const request = supertest(app);
const ideasUrl = '/ideas';
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

let testIdea = {
    content: 'Cross-platform local ability',
    impact: 8,
    ease: 3,
    confidence: 1
}

let testIdeaModel = new IdeaModel(testIdea);
const tokenManager = new TokenManagerService();

jest.setTimeout(100000);
jest.mock('../../../src/services/users/user_service');
jest.mock('../../../src/services/ideas/idea');

describe('Ideas - Create', () => {
    let tokens;
    let testUserModel;

    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
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

    beforeEach((done) => {
        UserService.mockClear();
        IdeaService.mockClear();
        jest.clearAllMocks();  //reset mock calls

        done();
    })

    it('should delete an idea and return a 200 response', async (done) => {
        try {
            mockDeleteIdea.mockResolvedValue();
            let response = await request.delete(`${ideasUrl}/${new ObjectID()}`)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'Bearer ' + testUserModel.accessToken)
                .send()
                .expect(204);
            done();
        } catch (error) {
            done(error);
        }
    });

});