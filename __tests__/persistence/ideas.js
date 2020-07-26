import _ from 'lodash';
import mongodb from 'mongodb';
import IdeaModel from '../../src/models/idea.js';
import UserModel from '../../src/models/user.js';
import Database from '../../src/persistence/mongodb/database.js';
import Ideas from '../../src/persistence/mongodb/ideas.js';
const ObjectID = mongodb.ObjectID;

let testUser = new UserModel({
    /* jshint camelcase: false */
    id: '5f184c04ff4b0383356cb0d5',
    email: 'test@user1.com',
    name: 'Test user1',
    password: 'TesUse@1',
    avatar_url: 'https://test-url-com'
    /* jshint camelcase: true */
});

const uniqueId = new ObjectID();
let testIdea = new IdeaModel({
    /* jshint camelcase: false */
    id: uniqueId.toString(),
    content: 'The is a super awesome idea',
    impact: 8,
    ease: 5,
    confidence: 4,
    created_at: 1553657927
    /* jshint camelcase: true */
});

jest.setTimeout(50000);

describe('Database - Ideas', () => {
    const testUserOneId = '5f184c04ff4b0383356cb0d5';
    const testUserTwoId = '5f184ccefd0520fc88e62111';
    let insertedIdeas = [];
    let ideas;
    let conn;

    beforeAll(async (done) => {
        const app = {
            emit: (event) => {
                return event;
            }
        }
        conn = new Database(app);
        conn._connectionStr = process.env.MONGO_URL;
        await conn.connect();
        ideas = new Ideas(conn);

        let tmpIdea = _.cloneDeep(testIdea);
        let testUserOneData = [];
        for (let index = 1; index <= 12; index++) {
            tmpIdea.content = String(index);
            tmpIdea.impact = Math.floor(Math.random() * 10) + 1;
            tmpIdea.ease = Math.floor(Math.random() * 10) + 1;
            tmpIdea.confidence = Math.floor(Math.random() * 10) + 1;
            let json = tmpIdea.toJson()
            json._id = new ObjectID();
            testUserOneData.push(json);
        }
        testUserOneData = _.orderBy(testUserOneData, ['average_score'], ['desc']);
        let testUserTwoData = [];
        for (let index = 1; index <= 3; index++) {
            tmpIdea.content = String(index);
            tmpIdea.impact = Math.floor(Math.random() * 10) + 1;
            tmpIdea.ease = Math.floor(Math.random() * 10) + 1;
            tmpIdea.confidence = Math.floor(Math.random() * 10) + 1;
            let json = tmpIdea.toJson()
            json._id = new ObjectID();
            testUserTwoData.push(json);
        }
        testUserTwoData = _.orderBy(testUserTwoData, ['average_score'], ['desc']);

        await conn.db.collection(testUserOneId).deleteMany({});
        await conn.db.collection(testUserTwoId).deleteMany({});
        insertedIdeas = await conn.db.collection(testUserOneId).insertMany(testUserOneData);
        await conn.db.collection(testUserTwoId).insertMany(testUserTwoData);
        done();
    })

    afterAll(() => {
        db.close();
    })

    beforeEach(async (done) => {
        ideas.collection = 'ideas';
        done();
    });

    afterEach(async (done) => {
        await ideas.database.connect();
        ideas.collection = 'ideas';
        await ideas.database.db.collection('ideas').deleteMany({});
        await ideas.database.close();
        done();
    });
    it('should not fail when applying getter and setter', (done) => {
        try {
            ideas.pageSize = 10;
            ideas.collection = 'ideas';
            let db = ideas.db;
            let collection = ideas.collection;
            let pageSize = ideas.pageSize;
            done()
        } catch (error) {
            done(error);
        }
    });
    it('should create a new idea in the database when the is no exiting id found', async (done) => {
        try {

            let userIdea = await ideas.insert(testIdea);
            const result = userIdea.toJson();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('content');
            expect(result).toHaveProperty('impact');
            expect(result).toHaveProperty('ease');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('average_score');
            expect(result).toHaveProperty('created_at');
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should update a idea in the database when an exiting id is found', async (done) => {
        try {
            const uniqueId = new ObjectID();
            let changeIdea = _.cloneDeep(testIdea);
            changeIdea.id = uniqueId;
            const insertedIdea = await ideas.insert(changeIdea);
            insertedIdea.content = 'Changed content';
            let userIdea = await ideas.update(insertedIdea);
            const result = userIdea.toJson();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('content');
            expect(result.content).toBe('Changed content');
            expect(result).toHaveProperty('ease');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('average_score');
            expect(result).toHaveProperty('created_at');
            expect(result.created_at).toBe(testIdea.createdAt);
            done();
        } catch (error) {
            done(error);
        }

    });

    it('should return the idea in the database when no update or insert operation took place because there was no change.', async (done) => {
        try {
            const orgIdea = await ideas.insert(testIdea);
            const result = await ideas.update(orgIdea);
            expect(result.id).toBe(orgIdea.id);
            expect(result.content).toBe(orgIdea.content);
            expect(result.impact).toBe(orgIdea.impact);
            expect(result.ease).toBe(orgIdea.ease);
            expect(result.confidence).toBe(orgIdea.confidence);
            expect(result.averageScore).toBe(orgIdea.averageScore);
            expect(result.createdAt).toBe(orgIdea.createdAt);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should find a idea by id when Id is a string', async (done) => {
        try {
            const insertedIdea = await ideas.insert(testIdea);
            const result = await ideas.findOneById(insertedIdea.id);
            expect(result.id.toString()).toBe(insertedIdea.id.toString());
            expect(result.content).toBe(insertedIdea.content);
            expect(result.impact).toBe(insertedIdea.impact);
            expect(result.ease).toBe(insertedIdea.ease);
            expect(result.confidence).toBe(insertedIdea.confidence);
            expect(result.averageScore).toBe(insertedIdea.averageScore);
            expect(result.createdAt).toBe(insertedIdea.createdAt);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should find a idea by id when id is instance of ObjectID', async (done) => {
        try {
            const insertedIdea = await ideas.insert(testIdea);
            const result = await ideas.findOneById(new ObjectID(insertedIdea.id));
            expect(result.id.toString()).toBe(insertedIdea.id.toString());
            expect(result.content).toBe(insertedIdea.content);
            expect(result.impact).toBe(insertedIdea.impact);
            expect(result.ease).toBe(insertedIdea.ease);
            expect(result.confidence).toBe(insertedIdea.confidence);
            expect(result.averageScore).toBe(insertedIdea.averageScore);
            expect(result.createdAt).toBe(insertedIdea.createdAt);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should find 10 ideas max by user id', async (done) => {
        try {
            let result = await ideas.findAllByUser(testUserOneId);
            expect(result.length).toBe(10);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    it('should find 4 ideas max by user id when the last id is givin for the 8th out of 12 ideas', async (done) => {
        try {

            const lastIdValue = insertedIdeas.ops[7].average_score;
            const expectedValues = _.filter(insertedIdeas.ops, ({ average_score }) => average_score < lastIdValue);
            const options = { last: lastIdValue };
            let result = await ideas.findAllByUser(testUserOneId, options);
            expect(result.length).toBe(expectedValues.length);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    it('should find the remainder ideas when pages exceed document count', async (done) => {
        try {
            let result = await ideas.findAllByUser(testUserOneId, { page: 2 });
            expect(result.length).toBe(2);
            result = await ideas.findAllByUser(testUserOneId, { page: 200 });
            expect(result.length).toBe(2);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    it('should find a user\'s idea and remove it', async (done) => {
        try {
            let userIdea = await ideas.insert(testIdea);
            let result = await ideas.delete(userIdea.id);
            expect(result).resolves;
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should delete a user by id', async (done) => {
        try {
            const uniqueId = new ObjectID();
            let deleteTestIdea = _.cloneDeep(testIdea);
            deleteTestIdea.id = uniqueId.toString();
            let deleteTestIdeaResult = await ideas.insert(deleteTestIdea);
            let result = await ideas.delete(deleteTestIdeaResult.id);
            expect(result).resolves;
            done();
        } catch (error) {
            done(error);
        }
    });


});