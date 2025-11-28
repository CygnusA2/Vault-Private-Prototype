import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserData {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentUploaded: boolean;
  documentsUploaded: boolean;
  selfieUploaded: boolean;
  fingerprintEnabled: boolean;
  irisEnabled: boolean;
  dowJonesChecked: boolean;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  email: string;
}

interface ConvertedAmounts {
  convertedCash: number;
  remainingAmount: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isReturningUser: boolean;
  needsPreApprove: boolean;
  needsIlliquidAssets: boolean;
  needsLedgerToken: boolean;
  needsOptimus: boolean;
  userData: UserData | null;
  convertedAmounts: ConvertedAmounts;
  login: () => void;
  logout: () => void;
  setUserData: (data: Partial<UserData>) => void;
  completeOnboarding: () => void;
  simulateReturningUser: () => void;
  completePreApprove: () => void;
  setNeedsPreApprove: (value: boolean) => void;
  setNeedsIlliquidAssets: (value: boolean) => void;
  setNeedsLedgerToken: (value: boolean) => void;
  setNeedsOptimus: (value: boolean) => void;
  setConvertedAmounts: (amounts: ConvertedAmounts) => void;
  completeOptimus: () => void;
}

const defaultUserData: UserData = {
  phoneNumber: "",
  firstName: "",
  lastName: "",
  documentType: "",
  documentUploaded: false,
  documentsUploaded: false,
  selfieUploaded: false,
  fingerprintEnabled: false,
  irisEnabled: false,
  dowJonesChecked: false,
  address: {
    street: "",
    city: "",
    country: "",
    postalCode: "",
  },
  email: "",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [needsPreApprove, setNeedsPreApproveState] = useState(false);
  const [needsIlliquidAssets, setNeedsIlliquidAssetsState] = useState(false);
  const [needsLedgerToken, setNeedsLedgerTokenState] = useState(false);
  const [needsOptimus, setNeedsOptimusState] = useState(false);
  const [userData, setUserDataState] = useState<UserData>(defaultUserData);
  const [convertedAmounts, setConvertedAmountsState] = useState<ConvertedAmounts>({
    convertedCash: 0,
    remainingAmount: 0,
  });

  const login = () => {
    setIsAuthenticated(true);
    setNeedsPreApproveState(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsReturningUser(false);
    setNeedsPreApproveState(false);
    setNeedsIlliquidAssetsState(false);
    setNeedsLedgerTokenState(false);
    setNeedsOptimusState(false);
    setUserDataState(defaultUserData);
  };

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState((prev) => ({ ...prev, ...data }));
  };

  const completeOnboarding = () => {
    setIsReturningUser(true);
    setIsAuthenticated(true);
    setNeedsPreApproveState(true);
  };

  const completePreApprove = () => {
    setNeedsPreApproveState(false);
  };

  const setNeedsPreApprove = (value: boolean) => {
    setNeedsPreApproveState(value);
  };

  const setNeedsIlliquidAssets = (value: boolean) => {
    setNeedsIlliquidAssetsState(value);
  };

  const setNeedsLedgerToken = (value: boolean) => {
    setNeedsLedgerTokenState(value);
  };

  const setNeedsOptimus = (value: boolean) => {
    setNeedsOptimusState(value);
  };

  const setConvertedAmounts = (amounts: ConvertedAmounts) => {
    setConvertedAmountsState(amounts);
  };

  const completeOptimus = () => {
    setNeedsOptimusState(false);
  };

  const simulateReturningUser = () => {
    setUserDataState({
      phoneNumber: "+1 234 567 8900",
      firstName: "Alexander",
      lastName: "Rothschild",
      documentType: "passport",
      documentUploaded: true,
      documentsUploaded: true,
      selfieUploaded: true,
      fingerprintEnabled: true,
      irisEnabled: true,
      dowJonesChecked: true,
      address: {
        street: "2800 Sand Hill Road",
        city: "Menlo Park",
        country: "California, United States",
        postalCode: "94025",
      },
      email: "a.rothschild@vault.private",
    });
    setIsReturningUser(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isReturningUser,
        needsPreApprove,
        needsIlliquidAssets,
        needsLedgerToken,
        needsOptimus,
        userData,
        convertedAmounts,
        login,
        logout,
        setUserData,
        completeOnboarding,
        simulateReturningUser,
        completePreApprove,
        setNeedsPreApprove,
        setNeedsIlliquidAssets,
        setNeedsLedgerToken,
        setNeedsOptimus,
        setConvertedAmounts,
        completeOptimus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
