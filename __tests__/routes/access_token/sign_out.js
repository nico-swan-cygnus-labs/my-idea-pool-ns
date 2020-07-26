import supertest from 'supertest';
import app from '../../../app.js';
import UserModel from '../../../src/models/user.js';
import { TokenExpired } from '../../../src/services/errors/token_manager';
import TokenManagerService, { mockDelete, mockVerify } from '../../../src/services/token_manager/token_manager.js';
import UserService, {
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
    tokens: {}

    /* jshint camelcase: true */
};
const tokenManager = new TokenManagerService();

jest.setTimeout(50000);
jest.mock('../../../src/services/users/user_service');
jest.mock('../../../src/services/token_manager/token_manager');

describe('Access - Sign out', () => {
    let tokens = {
        jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QtdXNlckBtYWlsLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpZCI6IjVmMTg0YzA0ZmY0YjAzODMzNTZjYjBkNSIsImlhdCI6MTU5NTUyNzY5MSwiZXhwIjoxNTk1NTI3NjkyfQ.Z6fI6M6ashUxxJCAYQcswAW4t2ZtCuXGiGwYuLYMc_M",
        refresh_token: "Nzg3Mjk0ODAtY2QwZi0xMWVhLWE4Y2MtZDM3ZTNjZDNmZTUzOjE1OTU1MzEyOTE3MjA=",
    };
    let testUserModel;

    beforeAll(async (done) => {
        testUserModel = new UserModel(testUser);
        mockValidateUserCredentials.mockResolvedValue(testUserModel);
        mockVerifyUserAndToken.mockResolvedValue(testUserModel);
        mockVerify.mockReturnValue({
            email: 'test-user@mail.com',
            name: 'Test User',
            id: '1',
            iat: 1595528055,
            exp: 1595528056,
        })
        done();
    })

    afterEach(async (done) => {
        UserService.mockClear();
        jest.clearAllMocks();  //reset mock calls
        done();
    })

    it('should response 401 when refresh token has expired.', async (done) => {
        try {
            mockDelete.mockRejectedValue(new TokenExpired());
            let response = await request.delete(accessTokensUrl)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'Bearer ' + tokens.jwt)
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    refresh_token: tokens.refresh_token
                })
                .expect(401);
            expect(response.body.message).toBe(new TokenExpired().message);
            done();

        } catch (error) {
            done(error);
        }
    });


    it('should response 204 and contains Successful Logout.', async (done) => {
        try {
            mockDelete.mockResolvedValue();

            let response = await request.delete(accessTokensUrl)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'Bearer ' + tokens.jwt)
                .set('x-debug-show-stack-trace', 'true')
                .send({
                    refresh_token: tokens.refresh_token
                })
                .expect(204);
            done();
        } catch (error) {
            done(error);
        }
    });


});






