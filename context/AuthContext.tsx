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

interface AuthContextType {
  isAuthenticated: boolean;
  isReturningUser: boolean;
  needsPreApprove: boolean;
  userData: UserData | null;
  login: () => void;
  logout: () => void;
  setUserData: (data: Partial<UserData>) => void;
  completeOnboarding: () => void;
  simulateReturningUser: () => void;
  completePreApprove: () => void;
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
  const [needsPreApprove, setNeedsPreApprove] = useState(false);
  const [userData, setUserDataState] = useState<UserData>(defaultUserData);

  const login = () => {
    setIsAuthenticated(true);
    setNeedsPreApprove(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsReturningUser(false);
    setNeedsPreApprove(false);
    setUserDataState(defaultUserData);
  };

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState((prev) => ({ ...prev, ...data }));
  };

  const completeOnboarding = () => {
    setIsReturningUser(true);
    setIsAuthenticated(true);
    setNeedsPreApprove(true);
  };

  const completePreApprove = () => {
    setNeedsPreApprove(false);
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
        userData,
        login,
        logout,
        setUserData,
        completeOnboarding,
        simulateReturningUser,
        completePreApprove,
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
