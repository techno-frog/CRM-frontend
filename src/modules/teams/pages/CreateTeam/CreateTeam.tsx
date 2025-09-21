import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import css from './CreateTeam.module.css';
import type { RootState } from '../../../../store/store';
import { resetToFirstStep, setCompanyRegion, setCurrentStep, setIsTransitioning, setSelectedAction, setRegistrationMode, type CreateTeamState } from '../../../../store/slices/createTeamSlice';
import { JoinTeamForm } from '../../components/JoinTeamForm/JoinTeamForm';
import { CreateTeamForm } from '../../components/CreateTeamForm/CreateTeamForm';
import { CompanyRegistrationForm } from '../../components/CompanyForm/CompanyRegistrationForm';
import { StepOne } from '../../components/steps/step1';
import { RegistrationStep } from '../../components/steps/RegistrationStep';
import { EmailVerificationStep } from '../../components/steps/EmailVerificationStep';

type ActionType = 'create' | 'join' | 'company';
type CompanyRegion = 'usa' | 'europe';

// ВЫНЕС КОМПОНЕНТ НАРУЖУ!
interface StepTwoProps {
  selectedAction: ActionType | null;
  companyRegion: 'usa' | 'europe' | null;
  onBack: () => void;
  onRegionSelect: (region: CompanyRegion | null) => void;
  isAuthenticated: boolean;
}

const StepTwo: React.FC<StepTwoProps> = ({
  selectedAction,
  companyRegion,
  onBack,
  onRegionSelect,
  isAuthenticated
}) => (
  <div className={css.stepContainer}>
    {!isAuthenticated && (
      <button className={css.backBtn} onClick={onBack}>
        <ArrowLeft size={20} />
        Назад
      </button>
    )}

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
  const location = useLocation();
  const {
    currentStep,
    selectedAction,
    companyRegion,
    isRegistrationMode,
    pendingRegistrationEmail
  } = useSelector((state: RootState) => state.createTeam as CreateTeamState);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Проверяем, открыта ли страница как /registration
  useEffect(() => {
    const isRegistrationPage = location.pathname === '/registration';
    dispatch(setRegistrationMode(isRegistrationPage));

    // Если это страница регистрации
    if (isRegistrationPage) {
      // Если пользователь уже авторизован, переходим сразу к выбору роли
      if (isAuthenticated) {
        dispatch(setCurrentStep(1));
      } else {
        // Если не авторизован, начинаем с регистрации
        dispatch(setCurrentStep(0));
      }
    }
  }, [location.pathname, dispatch, isAuthenticated]);

  const handleStepChange = useCallback((action: ActionType) => {
    dispatch(setSelectedAction(action));
    dispatch(setIsTransitioning(true));
    setTimeout(() => {
      dispatch(setCurrentStep(2));
      dispatch(setIsTransitioning(false));
    }, 400);
  }, [dispatch]);

  const handleEmailVerificationRequired = useCallback(() => {
    dispatch(setIsTransitioning(true));
    setTimeout(() => {
      dispatch(setCurrentStep(0.5));
      dispatch(setIsTransitioning(false));
    }, 400);
  }, [dispatch]);

  const handleEmailVerificationComplete = useCallback(() => {
    dispatch(setIsTransitioning(true));
    setTimeout(() => {
      dispatch(setCurrentStep(1));
      dispatch(setIsTransitioning(false));
    }, 400);
  }, [dispatch]);

  const handleBackFromEmailVerification = useCallback(() => {
    dispatch(setIsTransitioning(true));
    setTimeout(() => {
      dispatch(setCurrentStep(0));
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

  const getProgressSteps = () => {
    if (isRegistrationMode) {
      return (
        <>
          <div className={css.progressStep}>
            <div className={`${css.stepCircle} ${(currentStep >= 0 || isAuthenticated) ? css.active : ''} ${isAuthenticated ? css.completed : ''}`}>
              {isAuthenticated ? '✓' : '1'}
            </div>
            <span className={css.stepLabel}>Регистрация</span>
          </div>
          <div className={`${css.progressLine} ${(currentStep >= 0.5 || isAuthenticated) ? css.filled : ''}`}></div>
          <div className={css.progressStep}>
            <div className={`${css.stepCircle} ${(currentStep >= 0.5 || isAuthenticated) ? css.active : ''} ${isAuthenticated ? css.completed : ''}`}>
              {isAuthenticated ? '✓' : '2'}
            </div>
            <span className={css.stepLabel}>Подтверждение</span>
          </div>
          <div className={`${css.progressLine} ${currentStep >= 1 ? css.filled : ''}`}></div>
          <div className={css.progressStep}>
            <div className={`${css.stepCircle} ${currentStep >= 1 ? css.active : ''}`}>3</div>
            <span className={css.stepLabel}>Роль</span>
          </div>
          <div className={`${css.progressLine} ${currentStep >= 2 ? css.filled : ''}`}></div>
          <div className={css.progressStep}>
            <div className={`${css.stepCircle} ${currentStep >= 2 ? css.active : ''}`}>4</div>
            <span className={css.stepLabel}>Детали</span>
          </div>
        </>
      );
    }

    return (
      <>
        <div className={css.progressStep}>
          <div className={`${css.stepCircle} ${currentStep >= 1 ? css.active : ''}`}>1</div>
          <span className={css.stepLabel}>Роль</span>
        </div>
        <div className={`${css.progressLine} ${currentStep >= 2 ? css.filled : ''}`}></div>
        <div className={css.progressStep}>
          <div className={`${css.stepCircle} ${currentStep >= 2 ? css.active : ''}`}>2</div>
          <span className={css.stepLabel}>Детали</span>
        </div>
      </>
    );
  };

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <div className={css.progressBar}>
          {getProgressSteps()}
        </div>

        <div className={css.contentWrapper}>
          <div className={css.stepSlider}>
            {isRegistrationMode && currentStep === 0 && (
              <div className={`${css.step} ${css.active}`}>
                <RegistrationStep onEmailVerificationRequired={handleEmailVerificationRequired} />
              </div>
            )}
            {isRegistrationMode && currentStep === 0.5 && (
              <div className={`${css.step} ${css.active}`}>
                <EmailVerificationStep
                  email={pendingRegistrationEmail}
                  onVerificationComplete={handleEmailVerificationComplete}
                  onBack={handleBackFromEmailVerification}
                />
              </div>
            )}
            {currentStep === 1 && (
              <div className={`${css.step} ${css.active}`}>
                <StepOne onActionSelect={handleStepChange} />
              </div>
            )}
            {currentStep === 2 && (
              <div className={`${css.step} ${css.active}`}>
                <StepTwo
                  selectedAction={selectedAction}
                  companyRegion={companyRegion}
                  onBack={handleBack}
                  onRegionSelect={handleRegionSelect}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;