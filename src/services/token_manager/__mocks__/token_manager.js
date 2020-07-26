
// Import this named export into your test file:
export const mockVerify = jest.fn();
export const mockCreate = jest.fn();
export const mockRefresh = jest.fn();
export const mockDelete = jest.fn();
export const mockUpdate = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        verify: mockVerify,
        create: mockCreate,
        refresh: mockRefresh,
        delete: mockDelete,
        update: mockUpdate
    };
});

export default mock;