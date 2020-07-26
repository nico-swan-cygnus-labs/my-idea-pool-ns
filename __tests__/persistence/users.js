import Database from '../../src/persistence/mongodb/database.js';
import Users from '../../src/persistence/mongodb/users.js';
import { Duplicate } from '../../src/services/errors/database.js';

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
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZCI6ImI1ZjNlZWVjLTgwNzUtNGNlNC04NzUxLWQ0YmIzZTY2ZTk4MyJ9.IOTjiSekbXnSXJJaAuJ3KtfSwNXEoNm0PXKcjP2hnbM', /* cspell:disable-line */
        refresh_token: 'YjVmM2VlZWMtODA3NS00Y2U0LTg3NTEtZDRiYjNlNjZlOTgzOjE2MjY2MzExODc='
    }
    /* jshint camelcase: true */
}

jest.setTimeout(50000);
describe('Database - User', () => {
    let users;
    beforeAll(async () => {
        const app = {
            emit: (event) => {
                return event;
            }
        }
        const db = new Database(app);
        db._connectionStr = process.env.MONGO_URL;
        await db.connect();
        users = new Users(db);
    })

    afterEach(async (done) => {
        await users.database.connect();
        await users.database.db.collection(users.collection).deleteMany({});
        await users.database.close();
        done();
    });

    it('should create a new user in the database', async (done) => {
        let user = await users.create(testUser);
        let result = user.toJson();
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('avatar_url');
        expect(result).toHaveProperty('tokens');
        expect(result.tokens).toHaveProperty('access_token');
        expect(result.tokens).toHaveProperty('refresh_token');
        done();
    });

    it('should fail to create a user with the same email address', async (done) => {
        let connection = await users.database.connect();
        let result = await connection.db.collection('users').insertOne(testUser);
        await connection.close();
        await expect(users.create(testUser)).rejects.toThrow(Duplicate);
        done();
    });

    it('should find a user by email address', async (done) => {
        try {
            await users.create(testUser);
            let user = await users.findOneByEmail(testUser.email)
            let result = user.toJson();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('avatar_url');
            expect(result).toHaveProperty('tokens');
            expect(result.tokens).toHaveProperty('access_token');
            expect(result.tokens).toHaveProperty('refresh_token');
            done();
        } catch (error) {
            done(error);
        }

    });

    it('should find a user by email and update tokens', async (done) => {
        try {
            await users.create(testUser);
            let result = await users.updateTokens(testUser.email, 'accessToken', 'refreshToken');
            expect(result).resolves;
            result = await users.updateTokens(testUser.email, '', '');
            expect(result).resolves;
            result = await users.updateTokens(testUser.email, undefined, undefined);
            expect(result).resolves;
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should find a user by email and remove it', async (done) => {
        try {
            const newUser = await users.create(testUser);
            await users.database.db.collection(newUser.id).insertOne({ test: 1 });
            let result = await users.delete(newUser.email, newUser.id);
            expect(result).resolves;
            done();
        } catch (error) {
            done(error);
        }
    });

});