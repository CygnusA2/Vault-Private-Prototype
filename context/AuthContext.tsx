import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserData {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentUploaded: boolean;
  selfieUploaded: boolean;
  fingerprintEnabled: boolean;
  irisEnabled: boolean;
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
  userData: UserData | null;
  login: () => void;
  logout: () => void;
  setUserData: (data: Partial<UserData>) => void;
  completeOnboarding: () => void;
  simulateReturningUser: () => void;
}

const defaultUserData: UserData = {
  phoneNumber: "",
  firstName: "",
  lastName: "",
  documentType: "",
  documentUploaded: false,
  selfieUploaded: false,
  fingerprintEnabled: false,
  irisEnabled: false,
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
  const [userData, setUserDataState] = useState<UserData>(defaultUserData);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsReturningUser(false);
    setUserDataState(defaultUserData);
  };

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState((prev) => ({ ...prev, ...data }));
  };

  const completeOnboarding = () => {
    setIsReturningUser(true);
    setIsAuthenticated(true);
  };

  const simulateReturningUser = () => {
    setUserDataState({
      phoneNumber: "+1 234 567 8900",
      firstName: "Alexander",
      lastName: "Rothschild",
      documentType: "passport",
      documentUploaded: true,
      selfieUploaded: true,
      fingerprintEnabled: true,
      irisEnabled: true,
      address: {
        street: "123 Park Avenue",
        city: "New York",
        country: "United States",
        postalCode: "10022",
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
        userData,
        login,
        logout,
        setUserData,
        completeOnboarding,
        simulateReturningUser,
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
