import api from './api';

/**
 * Exchange Google credential ID token for JWT session token
 * @param {string} credential - Google OAuth ID Token
 * @param {boolean} isMock - Whether to bypass and authenticate as Mock User
 * @returns {Promise<Object>} Object containing user data and JWT token
 */
export const loginWithGoogle = async (credential, isMock = false) => {
  const response = await api.post('/auth/google', { credential, isMock });
  return response.data;
};
