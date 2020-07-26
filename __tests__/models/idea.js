import IdeaModel from '../../src/models/idea.js';
import { ContentExceedSize, ContentNaS, DateNaN, InvalidDateValue, MetricNaN, MetricNotInRange } from '../../src/services/errors/idea_model.js';
const testIdea = {
    /* jshint camelcase: false */
    id: 'f06cacf1-ac4b-4b34-b00f-aef6d7cf1459',
    content: 'The is a super awesome idea',
    impact: 8,
    ease: 5,
    confidence: 4,
    created_at: 1553657927
    /* jshint camelcase: true */
};

describe('Idea Model', () => {
    test('should internalize and empty idea model object', done => {
        try {
            let idea = new IdeaModel();
            expect(idea.id).toBeUndefined();
            expect(idea.content).toBeUndefined();
            expect(idea.impact).toBeUndefined();
            expect(idea.ease).toBeUndefined();
            expect(idea.confidence).toBeUndefined();
            expect(idea.averageScore).toBe(0.000000000000000);
            expect(idea.createdAt).not.toBeUndefined();
            done();
        } catch (error) {
            done(error);
        }
    });
    test('should internalize with constructor idea model object', (done) => {
        try {
            let idea = new IdeaModel(testIdea);
            expect(idea.id).toBe(testIdea.id);
            expect(idea.content).toBe(testIdea.content);
            expect(idea.impact).toBe(testIdea.impact);
            expect(idea.confidence).toBe(testIdea.confidence);
            expect(idea.ease).toBe(testIdea.ease);
            expect(idea.createdAt).toBe(testIdea.created_at);
            done();

        } catch (error) {
            done(error);
        }

    });

    test('should convert to JSON', (done) => {
        try {
            const idea = new IdeaModel(testIdea);
            const json = idea.toJson();
            expect(() => { idea.toJson(); }).not.toThrow();
            expect(json).toMatchObject(testIdea);
            done();

        } catch (error) {
            done(error);
        }

    });

    test('should set values from empty', (done) => {
        try {
            let idea = new IdeaModel();
            expect(() => { idea.id = testIdea.id }).not.toThrow();
            expect(() => { idea.content = testIdea.content }).not.toThrow();
            expect(() => { idea.impact = testIdea.impact }).not.toThrow();
            expect(() => { idea.confidence = testIdea.confidence }).not.toThrow();
            expect(() => { idea.ease = testIdea.ease }).not.toThrow();
            expect(() => { idea.createdAt = testIdea.created_at }).not.toThrow();

            expect(idea.id).toBe(testIdea.id);
            expect(idea.content).toBe(testIdea.content);
            expect(idea.impact).toBe(testIdea.impact);
            expect(idea.confidence).toBe(testIdea.confidence);
            expect(idea.ease).toBe(testIdea.ease);
            expect(idea.createdAt).toBe(testIdea.created_at);

            done();

        } catch (error) {
            done(error);
        }

    });

    test('should fail if content more than 255 or not a string', (done) => {
        let idea = new IdeaModel();
        const char256Str = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin tempus ligula et dictum tristique. Curabitur at fringilla massa. Duis pretium, magna at lacinia condimentum, leo dolor vulputate metus, porta mollis arcu nunc nec mauris. Phasellus sodales sed.';
        expect(() => { idea.content = char256Str }).toThrow(ContentExceedSize);
        const numberValue = 0;
        expect(() => { idea.content = numberValue }).toThrow(ContentNaS);
        done();
    });

    test('should fail if metics are not numbers or is not between 1 and 10', (done) => {
        try {
            let idea = new IdeaModel();
            expect(() => { idea.impact = 'Lorem' }).toThrow(MetricNaN);
            expect(() => { idea.impact = 12 }).toThrow(MetricNotInRange);
            expect(() => { idea.ease = 'Lorem' }).toThrow(MetricNaN);
            expect(() => { idea.ease = 0 }).toThrow(MetricNotInRange);
            expect(() => { idea.confidence = 'Lorem' }).toThrow(MetricNaN);
            expect(() => { idea.confidence = 11 }).toThrow(MetricNotInRange);
            done();
        } catch (error) {
            done(error);
        }
    });

    test('should fail if created at date is not a epoch number', (done) => {
        let idea = new IdeaModel();
        const charStr = '1231231283712';
        expect(() => { idea.createdAt = charStr }).toThrow(DateNaN);
        const numberValue = 12;
        expect(() => { idea.createdAt = numberValue }).toThrow(InvalidDateValue);
        done();
    });


});
