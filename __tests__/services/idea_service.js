import _ from 'lodash';
import mongodb from 'mongodb';
import IdeaModel from '../../src/models/idea.js';
import UserModel from '../../src/models/user.js';
import Database from '../../src/persistence/mongodb/database.js';
import Ideas, { mockDelete, mockFindAllByUser, mockFindOneById, mockInsert, mockUpdate } from '../../src/persistence/mongodb/ideas.js';
import { NotFound } from '../../src/services/errors/database.js';
import {
    IdeaDeleteError,
    IdeaError,
    IdeaIdMissing, IdeaInsertError,
    IdeaNotFound, IdeaRetrievalError,
    IdeaUpdateError, InvalidLastScore, InvalidPageNumber
} from '../../src/services/errors/idea_service.js';
import IdeaService from '../../src/services/ideas/idea.js';

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
const testIdea = new IdeaModel({
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
jest.mock('../../src/persistence/mongodb/ideas');

describe('Service - Ideas', () => {
    let ideaService;

    beforeAll(async (done) => {
        const db = new Database();
        ideaService = new IdeaService(db);
        done();
    })

    beforeEach((done) => {
        Ideas.mockClear();
        jest.clearAllMocks();  //reset mock calls
        done()
    })

    it('should create idea', async (done) => {
        mockInsert.mockResolvedValue(testIdea);
        const result = await ideaService.create(testUser, testIdea);
        expect(result.content).toBe(testIdea.content);
        done();
    });

    it('should fail to create an idea when the was an error inserting the idea', async (done) => {
        mockInsert.mockRejectedValue(new Error('Test'));
        await expect(ideaService.create(testUser, testIdea))
            .rejects.toThrow(IdeaInsertError);
        done();
    });

    it('should fail to create idea when Idea is in an invalid format', async (done) => {
        let testIdeaInvalid = _.clone(testIdea.toJson());
        testIdeaInvalid.impact = 12;
        await expect(ideaService.create(testUser, testIdeaInvalid)).rejects.toThrow(IdeaError);
        done();
    });

    it('should update idea', async (done) => {
        mockUpdate.mockResolvedValue(testIdea);
        const result = await ideaService.update(testUser, testIdea, testIdea.id);
        expect(result.content).toBe(testIdea.content);
        done();
    });

    it('should fail to update idea when id is missing ', async (done) => {
        await expect(ideaService.update(testUser, testIdea)).rejects.toThrow(IdeaIdMissing);
        done();
    });

    it('should fail to update idea when user is not found', async (done) => {
        mockUpdate.mockRejectedValue(new NotFound());
        await expect(ideaService.update(testUser, testIdea, testIdea.id)).rejects.toThrow(IdeaNotFound);
        done();
    });

    it('should fail to update an idea when the was an error inserting the idea', async (done) => {
        mockUpdate.mockRejectedValue(new Error('Test'));
        await expect(ideaService.update(testUser, testIdea, testIdea.id))
            .rejects.toThrow(IdeaUpdateError);
        done();
    });

    it('should fail to update idea when Idea is in an invalid format', async (done) => {
        let testIdeaInvalid = _.clone(testIdea.toJson());
        testIdeaInvalid.impact = 12;
        await expect(ideaService.update(testUser, testIdeaInvalid, testIdeaInvalid.id)).rejects.toThrow(IdeaError);
        done();
    });

    it('should delete idea', async (done) => {
        mockDelete.mockResolvedValue(testIdea);
        const result = await ideaService.delete(testUser, testIdea.id);
        expect(result.content).toBe(testIdea.content);
        done();
    });

    it('should fail to delete idea', async (done) => {
        mockDelete.mockRejectedValue(new Error('Test'));
        await expect(ideaService.delete(testUser, testIdea)).rejects.toThrow(IdeaDeleteError);
        done();
    });

    it('should fail to delete idea when idea not found', async (done) => {
        mockDelete.mockRejectedValue(new NotFound());
        await expect(ideaService.delete(testUser, testIdea)).rejects.toThrow(IdeaNotFound);
        done();
    });

    it('should find one by id idea', async (done) => {
        mockFindOneById.mockResolvedValue(testIdea);
        const result = await ideaService.getIdeasById(testUser, testIdea.id);
        expect(result.content).toBe(testIdea.content);
        done();
    });

    it('should fail to find one idea when not finding an idea', async (done) => {
        mockFindOneById.mockRejectedValue(new NotFound);
        await expect(ideaService.getIdeasById(testUser, testIdea.id)).rejects.toThrow(IdeaNotFound);
        done();
    });

    it('should fail to find one idea', async (done) => {
        mockFindOneById.mockRejectedValue(new Error('Test'));
        await expect(ideaService.getIdeasById(testUser, testIdea.id)).rejects.toThrow(IdeaRetrievalError);
        done();
    });

    it('should find ideas by user', async (done) => {
        let ideasResult = []
        for (let index = 0; index < 10; index++) {
            testIdea.id = new ObjectID();
            testIdea.content = String(index);
            ideasResult.push(testIdea);

        }
        mockFindAllByUser.mockResolvedValue(ideasResult);
        let result = await ideaService.getIdeasByUser(testUser);
        await expect(result.length).toBe(10)
        done();
    });

    it('should fail to find ideas by user when page is not a integer number grater than 0', async (done) => {
        let options = {};
        options.page = 'ten';
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidPageNumber);
        options.page = '1';
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidPageNumber);
        options.page = 1.1;
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidPageNumber);
        options.page = Number('NaN');
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidPageNumber);
        options.page = -1;
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidPageNumber);

        done();
    });

    it('should fail to find ideas by user when last is not a number grater than 0', async (done) => {
        let options = {};
        options.last = 'ten';
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidLastScore);
        options.last = Number('NaN');
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidLastScore);
        options.last = -1;
        await expect(ideaService.getIdeasByUser(testUser, options)).rejects.toThrow(InvalidLastScore);
        done();
    });

    it('should fail to find one idea', async (done) => {
        mockFindAllByUser.mockRejectedValue(new Error('Test'));
        await expect(ideaService.getIdeasByUser(testUser, testIdea.id)).rejects.toThrow(IdeaRetrievalError);
        done();
    });

});