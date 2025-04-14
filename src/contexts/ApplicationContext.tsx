
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ApplicationData = {
  // Step 1 - Basic Information
  robloxUsername: string;
  robloxId: string;
  discordId: string;
  age: number | string;
  activityLevel: number;
  
  // Step 2 - Understanding Rules
  whyModerator: string;
  frpUnderstanding: string;
  vdmUnderstanding: string;
  taschenRpUnderstanding: string;
  serverAgeUnderstanding: number;
  
  // Step 3 - Situation Handling
  situationHandling: string;
  bodycamUnderstanding: string;
  friendRuleViolation: string;
  
  // Step 3 - Server Information
  otherServerNames: string;
  otherServerInvites: string;
  
  // Step 3 - Experience and Notes
  adminExperience: string;
  notes: string;
  acceptTerms: boolean;
  isUnder12: boolean; // Flag for underage users
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
  setIsUnder12: (value: boolean) => void;
};

const defaultApplicationData: ApplicationData = {
  robloxUsername: '',
  robloxId: '',
  discordId: '',
  age: '',
  activityLevel: 5,
  whyModerator: '',
  frpUnderstanding: '',
  vdmUnderstanding: '',
  taschenRpUnderstanding: '',
  serverAgeUnderstanding: 0,
  situationHandling: '',
  bodycamUnderstanding: '',
  friendRuleViolation: '',
  otherServerNames: '',
  otherServerInvites: '',
  adminExperience: '',
  notes: '',
  acceptTerms: false,
  isUnder12: false
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
  
  const setIsUnder12 = (value: boolean) => {
    setApplicationData(prev => ({ ...prev, isUnder12: value }));
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
      resetForm,
      setIsUnder12
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
