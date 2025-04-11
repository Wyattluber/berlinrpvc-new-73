
import React, { createContext, useContext, useState, ReactNode } from 'react';

type PartnerApplicationData = {
  // Basic Information
  discordId: string;
  discordInvite: string;
  reason: string;
  requirements: string;
  hasOtherPartners: boolean;
  otherPartners: string;
};

type PartnerApplicationContextType = {
  applicationData: PartnerApplicationData;
  updateApplicationData: (data: Partial<PartnerApplicationData>) => void;
  resetForm: () => void;
};

const defaultApplicationData: PartnerApplicationData = {
  discordId: '',
  discordInvite: 'https://discord.gg/',
  reason: '',
  requirements: '',
  hasOtherPartners: false,
  otherPartners: '',
};

export const PartnerApplicationContext = createContext<PartnerApplicationContextType | undefined>(undefined);

export const PartnerApplicationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [applicationData, setApplicationData] = useState<PartnerApplicationData>(defaultApplicationData);

  const updateApplicationData = (data: Partial<PartnerApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setApplicationData(defaultApplicationData);
  };

  return (
    <PartnerApplicationContext.Provider value={{
      applicationData,
      updateApplicationData,
      resetForm,
    }}>
      {children}
    </PartnerApplicationContext.Provider>
  );
};

export const usePartnerApplication = () => {
  const context = useContext(PartnerApplicationContext);
  if (context === undefined) {
    throw new Error("usePartnerApplication must be used within a PartnerApplicationProvider");
  }
  return context;
};
