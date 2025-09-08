import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { rolesApi } from '../../api/rolesApi';

interface RolesState {
  selectedRoleId: string | null;
  filters: {
    showInactive: boolean;
    resourceType: string | null;
  };
}

const initialState: RolesState = {
  selectedRoleId: null,
  filters: {
    showInactive: false,
    resourceType: null,
  },
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setSelectedRole: (state, action: PayloadAction<string | null>) => {
      state.selectedRoleId = action.payload;
    },
    setShowInactive: (state, action: PayloadAction<boolean>) => {
      state.filters.showInactive = action.payload;
    },
    setResourceTypeFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.resourceType = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    // Можно добавить обработку результатов API запросов
    builder.addMatcher(
      rolesApi.endpoints.deleteRole.matchFulfilled,
      (state) => {
        state.selectedRoleId = null;
      }
    );
  },
});

export const {
  setSelectedRole,
  setShowInactive,
  setResourceTypeFilter,
  resetFilters,
} = rolesSlice.actions;

export default rolesSlice.reducer;