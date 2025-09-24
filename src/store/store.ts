import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import authReducer from './slices/authSlice';
import createTeamReducer from './slices/createTeamSlice';
import { rolesApi } from '../api/rolesApi';
import { invitesApi } from '../api/invitesApi';
import { teamsApi } from '../api/teamsApi';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

// Create listener middleware for cross-API invalidation
const listenerMiddleware = createListenerMiddleware();

// Listen for successful invite acceptance and invalidate activities
listenerMiddleware.startListening({
  matcher: isAnyOf(invitesApi.endpoints.acceptInvite.matchFulfilled),
  effect: async (_, listenerApi) => {
    // Invalidate activities when invite is accepted
    listenerApi.dispatch(baseApi.util.invalidateTags(['Activities']));
  },
});

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
      .prepend(listenerMiddleware.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
