
import React, { createContext, useContext, useState } from 'react';

export interface ApplicationData {
  // Basic Info
  robloxUsername: string;
  robloxId: string;
  discordId: string;
  age: number | undefined;
  activityLevel: number;
  isUnder12: boolean;
  
  // Rules Understanding
  frpUnderstanding: string;
  vdmUnderstanding: string;
  rdmUnderstanding: string;
  taschenRpUnderstanding: string;
  serverAgeUnderstanding: number | undefined;
  
  // Situations
  situationHandling: string;
  bodycamUnderstanding: string;
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
}

const defaultApplicationData: ApplicationData = {
  robloxUsername: '',
  robloxId: '',
  discordId: '',
  age: undefined,
  activityLevel: 1,
  isUnder12: false,
  
  frpUnderstanding: '',
  vdmUnderstanding: '',
  rdmUnderstanding: '',
  taschenRpUnderstanding: '',
  serverAgeUnderstanding: undefined,
  
  situationHandling: '',
  bodycamUnderstanding: '',
  friendRuleViolation: '',
  otherServerNames: '',
  otherServerInvites: '',
  adminExperience: '',
  notes: '',
  acceptTerms: false,
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>(defaultApplicationData);
  
  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };
  
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const resetForm = () => {
    setCurrentStep(1);
    setApplicationData(defaultApplicationData);
  };
  
  const setIsUnder12 = (value: boolean) => {
    setApplicationData(prev => ({ ...prev, isUnder12: value }));
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
        setIsUnder12
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};
