
import _ from 'lodash';
import { ObjectID } from 'mongodb';
import UserModel from '../../src/models/user.js';
import * as Errors from '../../src/services/errors/user_model.js';

const email = 'test@test-email.com';
const displayName = 'Test User';
const password = 'TestP@ss#1';
const testUser = {
    /* jshint camelcase: false */
    email: email,
    name: displayName,
    password: password,
    avatar_url: 'https://test-url-com',
    tokens: {
        access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE1NTM2NTg1MjYsImlkIjoidGcyYjlrbzNuIiwiZW1haWwiOiJlbWFpbC0zQHRlc3QuY29tIiwibmFtZSI6Im5hbWUtMyJ9.ywtNfm8wroPwqBqkmxfTWcYu-vMdbA6wi-x6IkxBT9HdZHFMm2idvXnMFiaeR4e-xio2cN0UdWqT8w9rctod8DuotextP1a_kWsqe7HlBdgyWMrentORgKNxtf9ORS40NDBH9LkJpoT_4StlFwuX4lN5dTPBOt042cpykoG53VO6ue668RzdRlKuj71L6Fx66aRLRJy-csnm9rTsW2kbwTShNbbEBzCYbOSvk0q5bm4ei6HfCJejb0PqV1Wi2dI06NomPUohoWmSjncdCWEihKdaJaNKl7aS5pUU5qvU-y2UtC0WnL0fmzrOoCS2VxQXvheJoyAU7KjcXVp1OY7nKqJ1kXod6Fx9JwdG-BLl_H34Shlx0S6ySi95tuB3MIoft2iXTZAlvzEKdIWAiYD8cjKHdnJF6wFE8QUOB0xbEA92gOOqp9yznp6pHbPmzpDQBsHyV292MMkctTycfMHRmbrL63M1Kfk0qpJrhgmB5szBYfUDpLXSVDaV2IQZXSPYuwzlc-ZJeqOrTD729qxSlg9HDqIPAzkBThUqTAJypxGS2LQ2x6eF19CU0efmZ3y-FGFxcsCWduPM8_oG9CR8cB6g8g05gcB8bZsCLtestOuzy0vHpwAV2Z8lvWNTLKxiivayxybrAq85VOkDsH4EbedmAvnE5NbRt7gMKnTUmUX14',
        refresh_token: 'refreshToken'
    }
    /* jshint camelcase: true */
}
describe('User Model', () => {
    test('should internalize and empty user model object', done => {
        try {
            let user = new UserModel();
            expect(user.email).toBeUndefined();
            expect(user.name).toBeUndefined();
            expect(user.password).toBeUndefined();
            expect(user.avatarUrl).toBeUndefined();
            expect(user.accessToken).toBeUndefined();
            expect(user.refreshToken).toBeUndefined();
            done();
        } catch (error) {
            done(error);
        }
    });
    test('should internalize with constructor user model object', (done) => {
        try {
            const user = new UserModel(testUser);
            const id = new ObjectID();
            user.id = id
            expect(user.id).toBe(id.toString());
            user.id = id.toString();
            expect(user.id).toBe(id.toString());
            expect(user.name).toBe(displayName);
            expect(user.name).toBe(displayName);
            expect(user.email).toBe(email);
            expect(user.password).toBe(password);
            /* jshint camelcase: false */
            expect(user.avatarUrl).toBe(testUser.avatar_url);
            /* jshint camelcase: true */
            done();

        } catch (error) {
            done(error);
        }

    });
    test('should use email address to get avatar url when there url is not given', (done) => {
        try {
            let removedAvatarUrl = _.clone(testUser);
            delete removedAvatarUrl.avatar_url;
            let expectedUrl = 'https://s.gravatar.com/avatar/941d6417ddbc607eb84a6692e74516bb';
            let user = new UserModel(removedAvatarUrl);

            /* jshint camelcase: false */
            expect(user.avatarUrl).toBe(expectedUrl);
            /* jshint camelcase: true */
            done();

        } catch (error) {
            done(error);
        }

    });
    test('should fail token validation when the access_token is not a jwt', (done) => {
        try {
            let noneJWTToken = _.cloneDeep(testUser);
            /* jshint camelcase: false */
            noneJWTToken.tokens.access_token = 'nonejwttoken';
            expect(() => { let user = new UserModel(noneJWTToken) }).toThrow(Errors.InvalidTokenFormat);
            /* jshint camelcase: true */
            done();

        } catch (error) {
            done(error);
        }
    });
    test('should tokens should be undefined and initialization should not not error when tokens not provided', (done) => {
        try {
            let noTokens = _.cloneDeep(testUser);
            /* jshint camelcase: false */
            delete noTokens.tokens.access_token;

            expect(() => { let user = new UserModel(noTokens) }).not.toThrow();
            let user = new UserModel(noTokens);
            expect(user.accessToken).toBeUndefined();

            noTokens = _.cloneDeep(testUser);
            delete noTokens.tokens.refresh_token;
            expect(() => { let user = new UserModel(noTokens) }).not.toThrow();
            user = new UserModel(noTokens);
            expect(user.refreshToken).toBeUndefined();
            /* jshint camelcase: true */
            done();

        } catch (error) {
            done(error);
        }

    });
    test('should convert to JSON', (done) => {
        try {
            let user = new UserModel(testUser);
            expect(user.toJson()).toMatchObject(testUser);
            done();

        } catch (error) {
            done(error);
        }

    });
    test('should be able to set get all attributes with the getter and setter method', (done) => {
        try {

            let user = new UserModel();
            //Setters
            expect(() => { user.email = testUser.email }).not.toThrow();
            expect(() => { user.name = testUser.name }).not.toThrow();
            expect(() => { user.password = testUser.password }).not.toThrow();
            /* jshint camelcase : false */
            expect(() => { user.avatarUrl = testUser.avatar_url }).not.toThrow();
            expect(() => { user.accessToken = testUser.tokens.access_token }).not.toThrow();
            expect(() => { user.refreshToken = testUser.tokens.refresh_token }).not.toThrow();
            /* jshint camelcase : true */

            //Getters
            expect(user.email).toBe(testUser.email);
            expect(user.name).toBe(testUser.name);
            expect(user.password).toBe(testUser.password);
            /* jshint camelcase : false */
            expect(user.avatarUrl).toBe(testUser.avatar_url);
            expect(user.accessToken).toBe(testUser.tokens.access_token);
            expect(user.refreshToken).toBe(testUser.tokens.refresh_token);
            /* jshint camelcase : true */
            done();

        } catch (error) {
            done(error);
        }

    });
    test('should set avatar url using email address when no avatar has been provided', (done) => {
        try {
            let expectedUrl = 'https://s.gravatar.com/avatar/941d6417ddbc607eb84a6692e74516bb';
            let user = new UserModel({ email: testUser.email });
            expect(() => { user.avatarUrl = '' }).not.toThrow();
            expect(user.avatarUrl).toBe(expectedUrl);

            user = new UserModel({ email: testUser.email });
            expect(() => { user.avatarUrl = undefined }).not.toThrow();
            expect(user.avatarUrl).toBe(expectedUrl);


            done();

        } catch (error) {
            done(error);
        }

    });
    test('should throw exception for invalid value', (done) => {
        try {

            let user = new UserModel();
            //Name errors
            expect(() => { user.name = '' }).toThrow(Errors.EmptyName);
            expect(() => { user.name = undefined }).toThrow(Errors.EmptyName);

            //Avatar error when email is empty
            expect(() => { user.avatarUrl = '' }).toThrow(Errors.EmptyAvatarUrl);
            expect(() => { user.avatarUrl = undefined }).toThrow(Errors.EmptyAvatarUrl);

            //Email errors
            expect(() => { user.email = 'Invalid email' }).toThrow(Errors.InvalidEmailFormat);
            expect(() => { user.email = '' }).toThrow(Errors.EmptyEmail);
            expect(() => { user.email = undefined }).toThrow(Errors.EmptyEmail);

            //Avatar error when email is empty
            expect(() => { user.avatarUrl = '' }).toThrow(Errors.EmptyAvatarUrl);
            expect(() => { user.avatarUrl = undefined }).toThrow(Errors.EmptyAvatarUrl);

            //Password errors
            expect(() => { user.password = 'password' }).toThrow(Errors.ContainPassword);
            expect(() => { user.password = 'password123' }).toThrow(Errors.ContainPassword);
            expect(() => { user.password = '' }).toThrow(Errors.EmptyPassword);
            expect(() => { user.password = undefined }).toThrow(Errors.EmptyPassword);

            //Access token error
            expect(() => { user.accessToken = 'fakeToken' }).toThrow(Errors.InvalidTokenFormat);
            expect(() => { user.accessToken = '' }).toThrow(Errors.EmptyToken);
            expect(() => { user.accessToken = undefined }).toThrow(Errors.EmptyToken);

            done();

        } catch (error) {
            done(error);
        }

    });
});
