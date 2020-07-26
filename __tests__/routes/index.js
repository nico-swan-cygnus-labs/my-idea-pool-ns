'use strict';
import supertest from 'supertest';
import app from '../../app.js';
import { InternalServerError } from '../../src/services/errors/request.js';
const request = supertest(app);
describe('index', () => {
    it('should response status 200 ', async (done) => {
        try {
            let result = await request.get('/').send()
                .expect(200)
                .then(response => {
                    // test something more
                    expect(response.text).toEqual(expect.stringContaining('My idea pool'));
                    done();
                });
        } catch (error) {
            done(error);
        }
    });

    it('should response with a Base error always', async (done) => {
        try {
            let result = await request.get('/?testError=true').send()
                .expect(500)
                .then(response => {
                    // test something more
                    const testError = new Error('Test')
                    const internalError = new InternalServerError(testError.message, request, testError)
                    expect(response.body.name).toBe(internalError.name);
                    expect(response.body.type).toBe(internalError.type);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        } catch (error) {
            done(error);
        }
    });
    // it('should response 404 Not found for a fake endpoint', async (done) => {
    //     try {
    //         let result = await request.get('/fake').send()
    //             .expect(404)
    //             .then(response => {
    //                 const notFoundError = new NotFound(request)
    //                 expect(response.body.name).toBe(notFoundError.name);
    //                 expect(response.body.type).toBe(notFoundError.type);
    //                 done();
    //             })
    //             .catch(error => {
    //                 done(error);
    //             });
    //     } catch (error) {
    //         done(error);
    //     }
    // });
});