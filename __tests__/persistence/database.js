import mongodb from 'mongodb';
import Database from '../../src/persistence/mongodb/database.js';
import { Connection } from '../../src/services/errors/database.js';
const ObjectID = mongodb.ObjectID;


const database = new Database();

//jest.mock('mongodb');
jest.setTimeout(50000);

describe('Database', () => {

    it('should fail when database connection couldn\'t connect', async (done) => {
        database.host = 'fakehost';
        let db = await database.connect()
            .catch(error => {
                expect(error instanceof Connection).toBe(true);
                expect(error.type).toBe(new Connection(error).type);
                expect(error.name).toBe(new Connection(error).name);
                expect(error.message).toBe(new Connection(error).message);
                expect(error.status).toBe(new Connection(error).status);
                done();
            });
    });
});