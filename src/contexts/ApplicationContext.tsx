
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ApplicationData = {
  // Step 1
  robloxUsername: string;
  robloxId: string;
  discordId: string;
  age: number | string;
  
  // Step 2
  frpUnderstanding: string;
  vdmUnderstanding: string;
  taschenRpUnderstanding: string;
  serverAgeUnderstanding: string;
  
  // Step 3
  situationHandling: string;
  bodycamUnderstanding: string;
  friendRuleViolation: string;
  otherServers: string;
  adminExperience: string;
  activityLevel: number;
  notes: string;
  acceptTerms: boolean;
};

type ApplicationContextType = {
  applicationData: ApplicationData;
  updateApplicationData: (data: Partial<ApplicationData>) => void;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  totalSteps: number;
  resetForm: () => void;
};

const defaultApplicationData: ApplicationData = {
  robloxUsername: '',
  robloxId: '',
  discordId: '',
  age: '',
  frpUnderstanding: '',
  vdmUnderstanding: '',
  taschenRpUnderstanding: '',
  serverAgeUnderstanding: '',
  situationHandling: '',
  bodycamUnderstanding: '',
  friendRuleViolation: '',
  otherServers: '',
  adminExperience: '',
  activityLevel: 5,
  notes: '',
  acceptTerms: false
};

export const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [applicationData, setApplicationData] = useState<ApplicationData>(defaultApplicationData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const resetForm = () => {
    setApplicationData(defaultApplicationData);
    setCurrentStep(1);
  };

  return (
    <ApplicationContext.Provider value={{
      applicationData,
      updateApplicationData,
      currentStep,
      goToNextStep,
      goToPreviousStep,
      goToStep,
      totalSteps,
      resetForm
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplication must be used within an ApplicationProvider");
  }
  return context;
};
