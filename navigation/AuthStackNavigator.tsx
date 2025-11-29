import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IntroScreen from "@/screens/IntroScreen";
import WelcomeScreen from "@/screens/WelcomeScreen";
import KYCNameScreen from "@/screens/KYCNameScreen";
import KYCDocumentScreen from "@/screens/KYCDocumentScreen";
import KYCSelfieScreen from "@/screens/KYCSelfieScreen";
import KYCBiometricScreen from "@/screens/KYCBiometricScreen";
import KYCAddressScreen from "@/screens/KYCAddressScreen";
import FaceRecognitionScreen from "@/screens/FaceRecognitionScreen";
import TwoFactorScreen from "@/screens/TwoFactorScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type AuthStackParamList = {
  Intro: undefined;
  Welcome: undefined;
  KYCName: undefined;
  KYCDocument: undefined;
  KYCSelfie: undefined;
  KYCBiometric: undefined;
  KYCAddress: undefined;
  FaceRecognition: undefined;
  TwoFactor: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
        headerShown: false,
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="KYCName"
        component={KYCNameScreen}
        options={{
          headerShown: true,
          headerTitle: "Personal Details",
        }}
      />
      <Stack.Screen
        name="KYCDocument"
        component={KYCDocumentScreen}
        options={{
          headerShown: true,
          headerTitle: "Identity Verification",
        }}
      />
      <Stack.Screen
        name="KYCSelfie"
        component={KYCSelfieScreen}
        options={{
          headerShown: true,
          headerTitle: "Photo Verification",
        }}
      />
      <Stack.Screen
        name="KYCBiometric"
        component={KYCBiometricScreen}
        options={{
          headerShown: true,
          headerTitle: "Biometric Setup",
        }}
      />
      <Stack.Screen
        name="KYCAddress"
        component={KYCAddressScreen}
        options={{
          headerShown: true,
          headerTitle: "Address Details",
        }}
      />
      <Stack.Screen name="FaceRecognition" component={FaceRecognitionScreen} />
      <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
    </Stack.Navigator>
  );
}
