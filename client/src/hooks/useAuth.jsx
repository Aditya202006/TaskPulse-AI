import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/clerk-react';
import { loginWithGoogle } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();

  // Local state for developer mock session bypass
  const [mockUser, setMockUser] = useState(null);
  const [mockLoading, setMockLoading] = useState(true);

  // 1. Rehydrate mock session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Only rehydrate mock session if Clerk is not signed in
    if (!isClerkSignedIn && token && storedUser) {
      try {
        setMockUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse mock user session:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setMockLoading(false);
  }, [isClerkSignedIn]);

  // 2. Dynamically attach fresh Clerk tokens to all Axios requests before they are sent
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        if (isClerkSignedIn) {
          try {
            // getToken() automatically refreshes expired session tokens under the hood
            const token = await getToken();
            if (token) {
              config.headers['Authorization'] = `Bearer ${token}`;
              localStorage.setItem('token', token);
            }
          } catch (err) {
            console.warn('[Axios Interceptor] Clerk token refresh failed:', err.message);
          }
        } else {
          // Fallback to localStorage token for mock dev session bypass
          const token = localStorage.getItem('token');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Eject interceptor when provider is unmounted or auth state changes
    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [isClerkSignedIn, getToken]);

  const loginMock = async () => {
    setMockLoading(true);
    try {
      const data = await loginWithGoogle('mock-google-token', true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMockUser(data.user);
      
      // Sync axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return data.user;
    } catch (error) {
      console.error('[AuthProvider] Mock Auth login failed:', error);
      throw error;
    } finally {
      setMockLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setMockUser(null);

    if (isClerkSignedIn) {
      await clerkSignOut();
    }
  };

  // Determine active profile (Clerk has priority)
  const user = isClerkSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || 'Clerk User',
        email: clerkUser.primaryEmailAddress?.emailAddress,
        picture: clerkUser.imageUrl
      }
    : mockUser;

  const isAuthenticated = isClerkSignedIn || !!mockUser;
  const loading = !isClerkLoaded || mockLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        loginMock,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
export default AuthContext;
