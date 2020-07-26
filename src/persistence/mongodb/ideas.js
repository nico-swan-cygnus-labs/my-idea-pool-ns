import _ from 'lodash';
import mongodb from 'mongodb';
import IdeaModel from '../../models/idea.js';
import { NotFound } from '../../services/errors/database.js';
const ObjectID = mongodb.ObjectID;

class Ideas {
    constructor(database) {
        this._database = database;
        this._collection = 'ideas';
        this._pageSize = 10;
    }
    /**
     * Set the collection to be user to retrieve the documents
     * @memberof Ideas
     */
    set collection(name) {
        this._collection = name;
    }
    /**
     * Set the pageSize to be used when retrieving documents
     * @memberof Ideas
     */
    set pageSize(size) {
        this._pageSize = size;
    }
    /**
     * Get the mongo database object
     * @readonly
     * @memberof Ideas
     */
    get database() {
        return this._database;
    }
    /**
     * Get the collection that will be used for the ideas
     * @memberof Ideas
     */
    get collection() {
        return this._collection;
    }
    /**
     * Get the page size to be used the default is 10
     * @memberof Ideas
     */
    get pageSize() {
        return this._pageSize;
    }
    /**
     * Insert an idea
     * @param  {IdealModel} idea The idea
     * @return {IdealModel} The idea in the database
     * @memberof Ideas
     */
    insert(idea) {
        return new Promise((resolve, reject) => {
            let json = idea.toJson();
            delete json.id; //Ensure we don't add the id attribute
            return this._database.connect()
                .then(conn => conn.db.collection(this._collection)
                    .insertOne(json))
                .then(result => resolve(new IdeaModel(result.ops[0])))
                .catch(error => reject(error));
        });
    }

    /**
     * Insert or Update an idea by searching for the document id
     * @param  {IdealModel} idea The idea
     * @return {IdealModel} The idea in the database
     * @memberof Ideas
     */
    update(idea) {
        return new Promise((resolve, reject) => {
            let json = idea.toJson();
            // Ensure we don't add a id attribute in the DB as we are using _id
            delete json.id;
            return this._database.connect()
                .then(conn => conn.db.collection(this._collection) //Attempt and Update then insert 
                    .updateOne({ '_id': new ObjectID(idea.id) },
                        { $set: json },
                        { upsert: false }))
                .then(result => {
                    // Find the record in the database and return it as the result. 
                    let searchId;
                    if (result.upsertedCount) {
                        searchId = result.result.upserted[0]._id;
                    } else if ((result.matchedCount && (result.upsertedCount || result.modifiedCount)) ||
                        (result.matchedCount && (!result.upsertedCount && !result.modifiedCount))) {
                        searchId = new ObjectID(idea.id);
                    } else if (!result.matchedCount) {
                        throw new NotFound();
                    }
                    return this._database.db.collection(this._collection)
                        .findOne({ '_id': searchId });
                })
                .then(result => resolve(new IdeaModel(result)))
                .catch(error => reject(error));
        })
    }

    /**
     * Find an idea by an id
     * @param  {string|ObjectID} id The document id
     * @return {IdeaModel} The idea that was found
     * @memberof Ideas
     */
    findOneById(id) {
        let query;
        if (id instanceof ObjectID) {
            id = { '_id': id };
        } else {
            query = { '_id': new ObjectID(id) }
        }
        return this.findOne(query);
    }

    /**
     * Find one idea based o the mongo query
     * @param  {object} query mongo query
     * @return {IdealModel} The Idea that was found
     * @memberof Ideas
     */
    findOne(query) {
        return new Promise((resolve, reject) => {
            return this._database.connect()
                .then(conn => conn.db.collection(this._collection)
                    .findOne(query))
                .then(found => {
                    if (found == null) {
                        reject(new NotFound);
                    }
                    resolve(new IdeaModel(found));
                })
                .catch(error => reject(error));
        })
    }

    /**
     * Find all ideas for a user sorted in descending order by the average score. 
     * @param  {string} collection the user's collection
     * @param  {object} options contains the lastId or page number
     * @return {Array<IdeaModel>} Return and array of ideas
     * @memberof Ideas
     */
    findAllByUser(collection, options) {
        return new Promise((resolve, reject) => {
            return this._database.connect()
                .then(conn => this.getPageQuery(conn, collection, options))
                .then(query => {
                    return this._database.db.collection(collection)
                        .find(query)
                        .sort({ average_score: -1 })
                        .limit(this._pageSize).toArray();
                })
                .then((result) => {
                    let userIdeas = [];
                    result.forEach(ideaDoc => {
                        userIdeas.push(new IdeaModel(ideaDoc));
                    });
                    resolve(userIdeas)
                })
                .catch(error => reject(error));
        })
    }

    /**
     * Get the record id query for the last document for paging
     * @param  {Connection} connection The mongodb connection 
     * @param  {string} collection The collection to look in 
     * @param  {object} options contains the lastId or page number
     * @return {object} The query object to apply for the the paging search
     * @memberof Ideas
     */
    getPageQuery(connection, collection, options) {
        return new Promise(async (resolve, reject) => {
            try {
                let query;
                let skipCount = 0;
                const userCollection = connection.db.collection(collection);
                if (_.has(options, 'last') && (options.last >= 0)) {
                    query = { 'average_score': { '$lt': options.last } };
                } else if (_.has(options, 'page')) {
                    //Calculate skip count
                    options.page--;
                    if (options.page > 0) {
                        const numDocs = await userCollection.countDocuments();
                        skipCount = (options.page * this._pageSize) - 1;
                        if (skipCount > numDocs) {
                            skipCount = (Math.round(numDocs / this._pageSize) * this._pageSize) - 1;
                        }
                    }
                    if (skipCount != 0) {
                        const lastDoc = await userCollection
                            .find(query)
                            .skip(skipCount)
                            .sort({ 'average_score': -1 })
                            .limit(1)
                            .next();
                        query = { 'average_score': { '$lt': await lastDoc.average_score } };
                    } else {
                        query = {};
                    }
                }
                resolve(query);
            } catch (error) {
                reject(error);
            }
        })
    }

    /**
     * Delete an idea by it document id
     * @param  {string} id 
     * @return {Promise}
     * @memberof Ideas
     */
    delete(id) {
        return new Promise((resolve, reject) => {
            return this._database.connect()
                .then(conn => conn.db.collection(this._collection)
                    .deleteOne({ '_id': new ObjectID(id) }))
                .then(deleted => {
                    if (deleted.deletedCount != 1) {
                        reject(new NotFound());
                    }
                    resolve();
                })
                .catch(error => reject(error));
        })
    }
}

export default Ideas;