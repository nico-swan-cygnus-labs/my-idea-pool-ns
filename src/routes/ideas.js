'use strict';
/*
 * The Presentation layer for the ideas API,
 * this also contains the swagger comments for the API documentation /api-docs
 */
import express from 'express';
import authenticate from '../middleware/auth.js';
import IdeaService from '../services/ideas/idea.js';
import { validateRequired } from '../services/validators/requests.js';

const ideasRouter = express.Router();

/**
 * Add a new idea to the users list.
 * @route POST /ideas
 * @group Ideas - Operations for managing ideas.
 * @param {IdeasRequest.model} request.body - The new idea object
 * @produces application/json
 * @consumes application/json
 * @returns {IdeasResponse.model} 200 - The newly added idea
 * @returns {IdeasError.model} 400 - Bad request
 * @security JWT
 */
ideasRouter.post('/', authenticate, async (req, res, next) => {
  const ideaService = new IdeaService(req.app.get('db'));
  const requireProperties = ['content', 'impact', 'ease', 'confidence'];
  await validateRequired(req, requireProperties)
    // Create an new idea 
    .then(() => ideaService.create(req.user, req.body))
    .then(idea => {
      next(res.status(200).send(idea.toJson()))
    })
    .catch(next);
});

/**
 * Add a new idea to the users list.
 * @route PUT /ideas/:id
 * @group Ideas - Operations for managing ideas.
 * @param {string} id.path.required The unique idea id stored. - eg: f06cacf1-ac4b-4b34-b00f-aef6d7cf1459
 * @param {IdeasRequest.model} request.body - the new idea object
 * @produces application/json
 * @consumes application/json
 * @returns {IdeasResponse.model} 200 - The updated idea
 * @returns {IdeasError.model} 400 - Bad request
 * @security JWT
 */
ideasRouter.put('/:id', authenticate, async (req, res, next) => {
  const ideaService = new IdeaService(req.app.get('db'));
  // Validate required properties
  const requireProperties = ['content', 'impact', 'ease', 'confidence'];
  await validateRequired(req, requireProperties)
    // Update the idea 
    .then(() => ideaService.update(req.user, req.body, req.params.id))
    .then(idea => res.status(200).send(idea.toJson()))
    // Send failure error
    .catch(next);
});

/**
 * Delete a new idea to the users list.
 * @route DELETE /ideas/:id
 * @group Ideas - Operations for managing ideas.
 * @param {string} id.path.required - The unique idea id stored. - eg: f06cacf1-ac4b-4b34-b00f-aef6d7cf1459
 * @returns {none} 204 - Successful
 * @returns {IdeasError.model} 400 - Bad request
 * @security JWT
 */
ideasRouter.delete('/:id', authenticate, async (req, res, next) => {
  const ideaService = new IdeaService(req.app.get('db'));
  // delete an idea
  await ideaService.delete(req.user, req.params.id)
    .then(() => res.status(204).send())
    // Send failure error
    .catch(next);
});

/**
 * Retrieve ideas for user.
 * @route GET /ideas/:id
 * @group Ideas - Operations for managing ideas.
 * @param {integer} id.query.required - The idea of a single idea for a user
 * @produces application/json
 * @consumes application/json
 * @returns {IdeasResponse.model} 200 - The requested idea  
 * @returns {RequestError.model} 400 - Bad request
 * @security JWT
 */
ideasRouter.get('/:id', authenticate, async (req, res, next) => {
  const ideaService = new IdeaService(req.app.get('db'));
  // get an idea
  await ideaService.getIdeasById(req.user, req.params.id)
    .then(idea => res.status(200).send(idea.toJson()))
    // Send failure error
    .catch(next);
});

/**
 * Retrieve ideas for user.
 * @route GET /ideas
 * @group Ideas - Operations for managing ideas.
 * @param {integer} page.query.required - A single page of ideas. 1 page of ideas is 10 ideas. - eg: 1
 * @param {integer} last.query - The last idea id, from the last page request.(faster page retrieval) 
 * @produces application/json
 * @consumes application/json
 * @returns {Array.IdeasResponse.model} 200 - The new JWT token
 * @returns {IdeasError.model} 400 - Bad request
 * @security JWT
 */
ideasRouter.get('/', authenticate, async (req, res, next) => {
  const ideaService = new IdeaService(req.app.get('db'));
  //set options
  let options = {};
  if (req.query.page) { options.page = Number(req.query.page) };
  if (req.query.last) { options.last = Number(req.query.last) };
  await ideaService.getIdeasByUser(req.user, options)
    .then(ideas => {
      let result = [];
      ideas.forEach((idea) => {
        result.push(idea.toJson());
      })
      res.status(200).send(result);
    })
    .catch(next);
});


export default ideasRouter;


//Model definitions:
/**
* @typedef IdeasRequest
* @property {string} content.required The idea description with a maximum 255 characters. - eg: My awesome idea
* @property {integer} impact.required Impact score between 1 to 10, 10 being the highest impact. - eg: 10
* @property {integer} ease.required Ease score between 1 to 10, 10 being the highest impact. - eg: 10
* @property {integer} confidence.required Confidence score between 1 to 10, 10 being the highest impact. - eg: 10
*/

/**
* @typedef IdeasResponse
* @property {string} id.required The unique record id of the idea. - eg: tg2b9rh1i
* @property {string} content.required The idea description with a maximum 255 characters. - eg: My awesome idea
* @property {integer} impact.required Impact score between 1 to 10, 10 being the highest impact. - eg: 10
* @property {integer} ease.required Ease score between 1 to 10, 10 being the highest impact. - eg: 7
* @property {integer} confidence.required Confidence score between 1 to 10, 10 being the highest impact. - eg: 9
* @property {integer} average_score.required The average score between Impact, Ease and Confidence . - eg: 8.666666666666667
* @property {integer} created_at.required The epoch timestamp of when the idea was saved. - eg: 1553657927
*/

/**
* @typedef IdeasError
* @property {enum} error_type.required Indicate the error category. - eg: Out of range,Other
* @property {string} error.required The error description. - eg: This is an error
*/