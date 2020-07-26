'use strict';
import _ from 'lodash';
import IdeaModel from '../../models/idea.js';
import Ideas from '../../persistence/mongodb/ideas.js';
import { NotFound } from '../errors/database.js';
import {
    IdeaDeleteError,
    IdeaError,
    IdeaIdMissing,
    IdeaInsertError,
    IdeaNotFound,
    IdeaRetrievalError,
    IdeaUpdateError,
    InvalidLastScore,
    InvalidPageNumber
} from '../errors/idea_service.js';

/**
 * The user service to interface with API and manage operations.
 *
 * @export
 * @class UserService
 */
class IdeaService {

    constructor(db) {
        this.ideas = new Ideas(db);
    }
    /**
     * Creates an idea under the user id collection
     * @param  {UserModel} user The user which this idea is for  
     * @param  {object} idea The super awesome idea in json format
     * @return {IdeaModel} The added idea model.
     * @memberof IdeaService
     */
    create(user, idea) {
        return new Promise((resolve, reject) => {
            try {
                this.ideas.collection = user.id;
                const ideaModel = new IdeaModel(idea);
                return this.ideas.insert(ideaModel)
                    .then(result => resolve(result))
                    .catch(error => reject(new IdeaInsertError(error)));
            } catch (error) {
                reject(new IdeaError(error.message, error));
            }
        });
    }
    /**
     * Perform an update of an idea
     * @param  {UserModel} user The user which this idea is for
     * @param  {object} idea The super awesome idea in json format
     * @param  {string} ideaId The id of the idea to be updated 
     * @return {IdeaModel} The updated idea model.
     * @memberof IdeaService
     */
    update(user, idea, ideaId) {
        return new Promise((resolve, reject) => {
            try {
                if (ideaId) {
                    idea.id = ideaId;
                } else {
                    reject(new IdeaIdMissing());
                }
                this.ideas.collection = user.id;
                const ideaModel = new IdeaModel(idea);
                return this.ideas.update(ideaModel)
                    .then(result => resolve(result))
                    .catch(error => {
                        if (error instanceof NotFound) {
                            reject(new IdeaNotFound());
                        }
                        reject(new IdeaUpdateError(error));
                    });
            } catch (error) {
                reject(new IdeaError(error.message, error));
            }
        })
    }
    /**
     * Remove an idea identified by its id
     * @param  {UserModel} user  The user which this idea is for
     * @param  {string} id The id for the idea 
     * @return {Promise} None
     * @memberof IdeaService
     */
    delete(user, id) {
        return new Promise((resolve, reject) => {
            this.ideas.collection = user.id;
            return this.ideas.delete(id)
                .then(result => resolve(result))
                .catch(error => {
                    if (error instanceof NotFound) {
                        reject(new IdeaNotFound());
                    }
                    reject(new IdeaDeleteError(error));
                });
        });
    }
    /**
     * Get an idea for a user
     * @param  {UserModel} user  The user which this idea is for
     * @param  {string} id The id for the idea
     * @return {IdeaModel} The idea that was found
     * @memberof IdeaService
     */
    getIdeasById(user, id) {
        return new Promise((resolve, reject) => {
            this.ideas.collection = user.id;
            return this.ideas.findOneById(id)
                .then(result => resolve(result))
                .catch(error => {
                    if (error instanceof NotFound) {
                        reject(new IdeaNotFound());
                    }
                    reject(new IdeaRetrievalError(error));
                });
        });
    }
    /**
     * Retrieve a list of ideas for a user with paging options
     * @param  {UserModel} user The user the ideas are for
     * @param  {object} options Should contain either a lastId of page attribute 
     * @return {Array.IdeaModel} A promise of ideas
     * @memberof IdeaService
     */
    getIdeasByUser(user, options) {
        return new Promise((resolve, reject) => {
            this.ideas.collection = user.id;
            // Validate the values for for last and page
            // When the last option is give it should ignore the page value 
            // and give 10 options from there this reduces db queries in 
            // determining the last from the page
            if (_.has(options, 'last')) {
                if (!(_.isFinite(options.last)) || (options.last < 0)) {
                    return reject(new InvalidLastScore());
                }
            }
            if (_.has(options, 'page') && !_.has(options, 'last')) {
                if (!_.isInteger(options.page) || (options.page <= 0)) {
                    return reject(new InvalidPageNumber());
                }
            }
            return this.ideas.findAllByUser(this.ideas.collection, options)
                .then(result => resolve(result))
                .catch(error => reject(new IdeaRetrievalError(error)));
        });
    }
}

export default IdeaService;
