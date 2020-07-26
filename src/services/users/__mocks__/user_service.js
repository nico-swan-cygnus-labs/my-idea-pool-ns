
// Import this named export into your test file:
export const mockGetProfile = jest.fn();
export const mockVerifyUserAndToken = jest.fn();
export const mockValidateUserCredentials = jest.fn();
export const mockSignUp = jest.fn();
export const mockUpdateUserTokens = jest.fn();
export const mockRemoveTokens = jest.fn();
export const mockEncryptPassword = jest.fn();
export const mockValidatePassword = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        getProfile: mockGetProfile,
        verifyUserAndToken: mockVerifyUserAndToken,
        validateUserCredentials: mockValidateUserCredentials,
        signUp: mockSignUp,
        updateUserTokens: mockUpdateUserTokens,
        removeTokens: mockRemoveTokens,
        encryptPassword: mockEncryptPassword,
        validatePassword: mockValidatePassword
    };
});

export default mock;