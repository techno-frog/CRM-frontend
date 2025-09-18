import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import authReducer from './slices/authSlice';
import createTeamReducer from './slices/createTeamSlice';
import { rolesApi } from '../api/rolesApi';
import { invitesApi } from '../api/invitesApi';
import { teamsApi } from '../api/teamsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [teamsApi.reducerPath]: teamsApi.reducer,
    [invitesApi.reducerPath]: invitesApi.reducer,
    createTeam: createTeamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(rolesApi.middleware)
      .concat(teamsApi.middleware)
      .concat(invitesApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
