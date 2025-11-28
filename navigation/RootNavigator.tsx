import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStackNavigator from "@/navigation/AuthStackNavigator";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import PreApproveScreen from "@/screens/PreApproveScreen";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type RootStackParamList = {
  Auth: undefined;
  PreApprove: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, needsPreApprove } = useAuth();
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      ) : needsPreApprove ? (
        <Stack.Screen
          name="PreApprove"
          component={PreApproveScreen}
          options={{
            ...getCommonScreenOptions({ theme, isDark }),
            headerShown: true,
            headerTitle: "Pre-Approve",
            headerBackVisible: false,
          }}
        />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
