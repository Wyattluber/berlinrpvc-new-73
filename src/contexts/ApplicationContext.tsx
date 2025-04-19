
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApplicationData {
  robloxUsername: string;
  robloxId: string;
  discordId: string;
  age: string;
  activityLevel: string;
  isUnder12: boolean;
  frpUnderstanding: string;
  vdmUnderstanding: string;
  rdmUnderstanding: string;
  taschenRpUnderstanding: string;
  serverAgeUnderstanding: string;
  bodycamUnderstanding: string;
  situationHandling: string;
  friendRuleViolation: string;
  otherServerNames: string;
  otherServerInvites: string;
  adminExperience: string;
  notes: string;
  acceptTerms: boolean;
}

interface ApplicationContextType {
  currentStep: number;
  applicationData: ApplicationData;
  updateApplicationData: (data: Partial<ApplicationData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetForm: () => void;
  setIsUnder12: (value: boolean) => void;
  setCurrentStep: (step: number) => void; // This is needed but will be restricted
}

const defaultApplicationData: ApplicationData = {
  robloxUsername: '',
  robloxId: '',
  discordId: '',
  age: '',
  activityLevel: '',
  isUnder12: false,
  frpUnderstanding: '',
  vdmUnderstanding: '',
  rdmUnderstanding: '',
  taschenRpUnderstanding: '',
  serverAgeUnderstanding: '',
  bodycamUnderstanding: '',
  situationHandling: '',
  friendRuleViolation: '',
  otherServerNames: '',
  otherServerInvites: '',
  adminExperience: '',
  notes: '',
  acceptTerms: false
};

export const ApplicationContext = createContext<ApplicationContextType>({
  currentStep: 1,
  applicationData: defaultApplicationData,
  updateApplicationData: () => {},
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  resetForm: () => {},
  setIsUnder12: () => {},
  setCurrentStep: () => {}
});

export const useApplication = () => useContext(ApplicationContext);

interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>(defaultApplicationData);

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prevData => ({ ...prevData, ...data }));
  };

  const goToNextStep = () => {
    // Validate that the current step is complete before allowing progression
    if (isStepComplete(currentStep, applicationData)) {
      setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => prev > 1 ? prev - 1 : prev);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setApplicationData(defaultApplicationData);
  };

  const setIsUnder12 = (value: boolean) => {
    updateApplicationData({ isUnder12: value });
  };

  // Function to check if the current step has all required fields completed
  const isStepComplete = (step: number, data: ApplicationData): boolean => {
    switch (step) {
      case 1:
        return !!(data.robloxUsername && data.discordId && data.age && data.activityLevel);
      case 2:
        return !!(
          data.frpUnderstanding && 
          data.vdmUnderstanding && 
          data.rdmUnderstanding && 
          data.taschenRpUnderstanding &&
          data.serverAgeUnderstanding
        );
      default:
        return true;
    }
  };

  return (
    <ApplicationContext.Provider
      value={{
        currentStep,
        applicationData,
        updateApplicationData,
        goToNextStep,
        goToPreviousStep,
        resetForm,
        setIsUnder12,
        setCurrentStep
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
