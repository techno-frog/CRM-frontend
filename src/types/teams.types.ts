export interface Team {
  id: string;
  name: string;
}

export interface FormData {
  inviteCode: string;
  teamName: string;
  userRole: string;
  companyName: string;
  companyTeamName: string;
  registrationNumber: string;
  employeeCount: string;
  companyUserRole: string;
}

export interface InviteItem {
  id: string;
  email: string;
}

export type ActionType = 'create' | 'join' | 'company';
export type CompanyRegion = 'usa' | 'europe';

export interface StepOneProps {
  onActionSelect: (action: ActionType) => void;
}

export interface JoinTeamFormProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

export interface CreateTeamFormProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

export interface CompanyRegistrationFormProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  companyRegion: CompanyRegion | null;
  onRegionSelect: (region: CompanyRegion | null) => void;
}

export interface RegionSelectorProps {
  onRegionSelect: (region: CompanyRegion) => void;
}

export interface CompanyFormProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  companyRegion: CompanyRegion;
  onBackToRegion: () => void;
}