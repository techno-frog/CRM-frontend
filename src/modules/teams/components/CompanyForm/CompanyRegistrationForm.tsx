import React from 'react';

import { CompanyForm } from './CompanyForm';
import { RegionSelector } from '../RegionSelector/RegionSelector';

interface CompanyRegistrationFormProps {
  companyRegion: 'usa' | 'europe' | null;
  onRegionSelect: (region: 'usa' | 'europe' | null) => void;
}

export const CompanyRegistrationForm: React.FC<CompanyRegistrationFormProps> = ({
  companyRegion,
  onRegionSelect
}) => {
  if (!companyRegion) {
    return <RegionSelector onRegionSelect={onRegionSelect} />;
  }

  return (
    <CompanyForm
      companyRegion={companyRegion}
      onBackToRegion={() => onRegionSelect(null)}
    />
  );
};