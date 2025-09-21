import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, AuthTokens } from '../../types/auth.types';
import { authApi } from '../../api/authApi';

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User } & AuthTokens>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        localStorage.setItem('accessToken', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        localStorage.setItem('accessToken', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
      })
      .addMatcher(authApi.endpoints.registerWithInvite.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        localStorage.setItem('accessToken', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state, { payload }) => {
        state.user = null;
        alert('fck')
        console.log(payload)
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addMatcher(authApi.endpoints.refreshTokens.matchFulfilled, (state, { payload }) => {
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        localStorage.setItem('accessToken', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
      });
  },
});

export const { setCredentials, logout, setLoading, setUser } = authSlice.actions;
export default authSlice.reducer;