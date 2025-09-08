import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface InviteItem {
  id: string;
  email: string;
}

export interface CreateTeamState {
  // Step management
  currentStep: 1 | 2;
  selectedAction: 'create' | 'join' | 'company' | null;
  isTransitioning: boolean;
  companyRegion: 'usa' | 'europe' | null;

  // Join team form
  inviteCode: string;

  // Create team form
  teamName: string;
  userRole: string;
  teamInvites: InviteItem[];

  // Company form
  companyName: string;
  companyTeamName: string;
  registrationNumber: string;
  employeeCount: string;
  companyUserRole: string;
  companyInvites: InviteItem[];
}

const initialState: CreateTeamState = {
  // Step management
  currentStep: 1,
  selectedAction: null,
  isTransitioning: false,
  companyRegion: null,

  // Join team form
  inviteCode: '',

  // Create team form
  teamName: '',
  userRole: '',
  teamInvites: [
    { id: '1', email: '' },
    { id: '2', email: '' }
  ],

  // Company form
  companyName: '',
  companyTeamName: '',
  registrationNumber: '',
  employeeCount: '',
  companyUserRole: '',
  companyInvites: [
    { id: '1', email: '' },
    { id: '2', email: '' }
  ]
};

const createTeamSlice = createSlice({
  name: 'createTeam',
  initialState,
  reducers: {
    // Step management actions
    setSelectedAction: (state, action: PayloadAction<'create' | 'join' | 'company'>) => {
      state.selectedAction = action.payload;
    },

    setCurrentStep: (state, action: PayloadAction<1 | 2>) => {
      state.currentStep = action.payload;
    },

    setIsTransitioning: (state, action: PayloadAction<boolean>) => {
      state.isTransitioning = action.payload;
    },

    setCompanyRegion: (state, action: PayloadAction<'usa' | 'europe' | null>) => {
      state.companyRegion = action.payload;
    },

    // Join team actions
    setInviteCode: (state, action: PayloadAction<string>) => {
      state.inviteCode = action.payload;
    },

    // Create team actions
    setTeamName: (state, action: PayloadAction<string>) => {
      state.teamName = action.payload;
    },

    setUserRole: (state, action: PayloadAction<string>) => {
      state.userRole = action.payload;
    },

    updateTeamInvite: (state, action: PayloadAction<{ id: string; email: string }>) => {
      const { id, email } = action.payload;
      const invite = state.teamInvites.find(invite => invite.id === id);
      if (invite) {
        invite.email = email;
      }
    },

    addTeamInvite: (state) => {
      state.teamInvites.push({
        id: Date.now().toString(),
        email: ''
      });
    },

    removeTeamInvite: (state, action: PayloadAction<string>) => {
      if (state.teamInvites.length > 1) {
        state.teamInvites = state.teamInvites.filter(invite => invite.id !== action.payload);
      }
    },

    // Company actions
    setCompanyName: (state, action: PayloadAction<string>) => {
      state.companyName = action.payload;
    },

    setCompanyTeamName: (state, action: PayloadAction<string>) => {
      state.companyTeamName = action.payload;
    },

    setRegistrationNumber: (state, action: PayloadAction<string>) => {
      state.registrationNumber = action.payload;
    },

    setEmployeeCount: (state, action: PayloadAction<string>) => {
      state.employeeCount = action.payload;
    },

    setCompanyUserRole: (state, action: PayloadAction<string>) => {
      state.companyUserRole = action.payload;
    },

    updateCompanyInvite: (state, action: PayloadAction<{ id: string; email: string }>) => {
      const { id, email } = action.payload;
      const invite = state.companyInvites.find(invite => invite.id === id);
      if (invite) {
        invite.email = email;
      }
    },

    addCompanyInvite: (state) => {
      state.companyInvites.push({
        id: Date.now().toString(),
        email: ''
      });
    },

    removeCompanyInvite: (state, action: PayloadAction<string>) => {
      if (state.companyInvites.length > 1) {
        state.companyInvites = state.companyInvites.filter(invite => invite.id !== action.payload);
      }
    },

    // Reset actions
    resetForm: (_) => {
      return initialState;
    },

    resetToFirstStep: (state) => {
      state.currentStep = 1;
      state.selectedAction = null;
      state.companyRegion = null;
      state.isTransitioning = false;
    }
  }
});

export const {
  // Step management
  setSelectedAction,
  setCurrentStep,
  setIsTransitioning,
  setCompanyRegion,

  // Join team
  setInviteCode,

  // Create team
  setTeamName,
  setUserRole,
  updateTeamInvite,
  addTeamInvite,
  removeTeamInvite,

  // Company
  setCompanyName,
  setCompanyTeamName,
  setRegistrationNumber,
  setEmployeeCount,
  setCompanyUserRole,
  updateCompanyInvite,
  addCompanyInvite,
  removeCompanyInvite,

  // Reset
  resetForm,
  resetToFirstStep
} = createTeamSlice.actions;

export default createTeamSlice.reducer;