import mongodb from 'mongodb';
import UserModel from '../../models/user.js';
import {
    Duplicate,
    FailedRemoveIdeas,
    NotFound
} from '../../services/errors/database.js';
const ObjectID = mongodb.ObjectID;

class Users {
    constructor(database) {
        this.database = database;
        this.collection = 'users';
    }
    /**
     * Create a user if not already existing
     * @param  {UserModel} user The user to be created
     * @return {UserModel}  The created user
     * @memberof Users
     */
    create(user) {
        return new Promise((resolve, reject) => {
            return this.database.connect()
                .then(conn => conn.db.collection(this.collection)
                    .findOne({ email: user.email }))
                .then(findResult => {
                    if (findResult != null) {
                        reject(new Duplicate());
                    } else {
                        return this.database.db.collection(this.collection)
                            .insertOne(user);
                    }
                })
                .then(result => resolve(new UserModel(result.ops[0])))
                .catch(error => reject(error));
        })
    }
    /**
     * Find user by email address
     * @param  {sting} email The users unique email address
     * @return {UserModel} the found user
     * @memberof Users
     */
    findOneByEmail(email) {
        return this.findOne({ 'email': email });
    }
    /**
     * Find user document by mongo query
     * @param  {object} query The mongodb query object 
     * @return {UserModel} The found user
     * @memberof Users
     */
    findOne(query) {
        return new Promise((resolve, reject) => {
            return this.database.connect()
                .then(conn => conn.db.collection(this.collection)
                    .findOne(query))
                .then(found => {
                    if (found == null) {
                        reject(new NotFound);
                    }
                    resolve(new UserModel(found));
                })
                .catch(error => reject(error));
        })
    }
    /**
     * Update the tokens of the user
     * @param  {string} email The users email address 
     * @param  {string} accessToken The access token to be stored
     * @param  {string} refreshToken The refresh token to be stored
     * @return {Promise} None
     * @memberof Users
     */
    updateTokens(email, accessToken, refreshToken) {
        return new Promise((resolve, reject) => {
            return this.database.connect()
                .then(conn => conn.db.collection(this.collection)
                    .updateOne({ 'email': email },
                        {
                            $set: {
                                'tokens.access_token': accessToken,
                                'tokens.refresh_token': refreshToken
                            }
                        })
                )
                .then(changed => {
                    if (changed.matchedCount != 1) {
                        reject(new NotFound());
                    }
                    resolve();
                })
                .catch(error => reject(error));
        })

    }
    // *? Was implemented but not to the API as it wasn't required. 
    /**
     * Remove a user by email address
     * @param  {string} email The users email address
     * @return 
     * @memberof Users
     */
    delete(email, id) {
        return new Promise((resolve, reject) => {
            return this.database.connect()
                .then(conn => conn.db.collection(this.collection)
                    .deleteOne({ 'email': email }))
                .then(deleted => {
                    if (deleted.deletedCount != 1) {
                        reject(new NotFound());
                    }
                    //Remove the users ideas
                    return this.database.db.collection(id).drop();
                })
                .then(status => {
                    if (status) {
                        resolve();
                    } else {
                        reject(new FailedRemoveIdeas());
                    }
                })
                .catch(error => reject(error));
        })

    }
}

export default Users;