import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';

import css from './CreateTeam.module.css';
import type { RootState } from '../../../../store/store';
import { resetToFirstStep, setCompanyRegion, setCurrentStep, setIsTransitioning, setSelectedAction } from '../../../../store/slices/createTeamSlice';
import { JoinTeamForm } from '../../components/JoinTeamForm/JoinTeamForm';
import { CreateTeamForm } from '../../components/CreateTeamForm/CreateTeamForm';
import { CompanyRegistrationForm } from '../../components/CompanyForm/CompanyRegistrationForm';
import { StepOne } from '../../components/steps/step1';

type ActionType = 'create' | 'join' | 'company';
type CompanyRegion = 'usa' | 'europe';

// ВЫНЕС КОМПОНЕНТ НАРУЖУ!
interface StepTwoProps {
  selectedAction: ActionType | null;
  companyRegion: 'usa' | 'europe' | null;
  onBack: () => void;
  onRegionSelect: (region: CompanyRegion | null) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({
  selectedAction,
  companyRegion,
  onBack,
  onRegionSelect
}) => (
  <div className={css.stepContainer}>
    <button className={css.backBtn} onClick={onBack}>
      <ArrowLeft size={20} />
      Назад
    </button>

    {selectedAction === 'join' && <JoinTeamForm />}
    {selectedAction === 'create' && <CreateTeamForm />}
    {selectedAction === 'company' && (
      <CompanyRegistrationForm
        companyRegion={companyRegion}
        onRegionSelect={onRegionSelect}
      />
    )}
  </div>
);

const CreateTeam: React.FC = () => {
  const dispatch = useDispatch();
  const {
    currentStep,
    selectedAction,
    companyRegion
  } = useSelector((state: RootState) => state.createTeam);

  const handleStepChange = useCallback((action: ActionType) => {
    dispatch(setSelectedAction(action));
    dispatch(setIsTransitioning(true));
    setTimeout(() => {
      dispatch(setCurrentStep(2));
      dispatch(setIsTransitioning(false));
    }, 400);
  }, [dispatch]);

  const handleBack = useCallback(() => {
    dispatch(setIsTransitioning(true));
    setTimeout(() => {
      dispatch(resetToFirstStep());
    }, 400);
  }, [dispatch]);

  const handleRegionSelect = useCallback((region: CompanyRegion | null) => {
    dispatch(setCompanyRegion(region));
  }, [dispatch]);

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <div className={css.progressBar}>
          <div className={css.progressStep}>
            <div className={`${css.stepCircle} ${currentStep >= 1 ? css.active : ''}`}>1</div>
            <span className={css.stepLabel}>Роль</span>
          </div>
          <div className={`${css.progressLine} ${currentStep >= 2 ? css.filled : ''}`}></div>
          <div className={css.progressStep}>
            <div className={`${css.stepCircle} ${currentStep >= 2 ? css.active : ''}`}>2</div>
            <span className={css.stepLabel}>Детали</span>
          </div>
        </div>

        <div className={css.contentWrapper}>
          <div className={css.stepSlider}>
            <div className={`${css.step} ${css.stepOne} ${currentStep === 1 ? css.active : css.exitLeft}`}>
              <StepOne onActionSelect={handleStepChange} />
            </div>
            <div className={`${css.step} ${css.stepTwo} ${currentStep === 2 ? css.active : css.enterRight}`}>
              <StepTwo
                selectedAction={selectedAction}
                companyRegion={companyRegion}
                onBack={handleBack}
                onRegionSelect={handleRegionSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;