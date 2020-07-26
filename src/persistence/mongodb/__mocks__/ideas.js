// Import this named export into your test file:
export const mockInsert = jest.fn();
export const mockFindOneById = jest.fn();
export const mockFindOne = jest.fn();
export const mockFindAllByUser = jest.fn();
export const mockDelete = jest.fn();
export const mockUpdate = jest.fn();
export const mockGetPageQuery = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        getPageQuery: mockGetPageQuery,
        update: mockUpdate,
        insert: mockInsert,
        findOneById: mockFindOneById,
        findOne: mockFindOne,
        findAllByUser: mockFindAllByUser,
        delete: mockDelete
    };
});

export default mock;