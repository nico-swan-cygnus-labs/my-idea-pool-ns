
// Import this named export into your test file:
export const mockGetIdeasById = jest.fn();
export const mockGetIdeasByUser = jest.fn();
export const mockCreateIdea = jest.fn();
export const mockDeleteIdea = jest.fn();
export const mockUpdateIdea = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        getIdeasByUser: mockGetIdeasByUser,
        getIdeasById: mockGetIdeasById,
        create: mockCreateIdea,
        delete: mockDeleteIdea,
        update: mockUpdateIdea
    };
});

export default mock;