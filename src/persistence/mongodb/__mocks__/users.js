// Import this named export into your test file:
export const mockCreate = jest.fn();
export const mockFindOneByEmail = jest.fn();
export const mockFindOne = jest.fn();
export const mockUpdateTokens = jest.fn();
export const mockDelete = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        create: mockCreate,
        findOneByEmail: mockFindOneByEmail,
        findOne: mockFindOne,
        updateTokens: mockUpdateTokens,
        delete: mockDelete
    };
});

export default mock;