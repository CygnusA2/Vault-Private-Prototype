import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStackNavigator from "@/navigation/AuthStackNavigator";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import PreApproveScreen from "@/screens/PreApproveScreen";
import IlliquidAssetsScreen from "@/screens/IlliquidAssetsScreen";
import LedgerTokenScreen from "@/screens/LedgerTokenScreen";
import OptimusScreen from "@/screens/OptimusScreen";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type RootStackParamList = {
  Auth: undefined;
  PreApprove: undefined;
  IlliquidAssets: undefined;
  LedgerToken: undefined;
  Optimus: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, needsPreApprove, needsIlliquidAssets, needsLedgerToken, needsOptimus } = useAuth();
  const { theme, isDark } = useTheme();

  const getCurrentScreen = () => {
    if (!isAuthenticated) return "Auth";
    if (needsPreApprove) return "PreApprove";
    if (needsIlliquidAssets) return "IlliquidAssets";
    if (needsLedgerToken) return "LedgerToken";
    if (needsOptimus) return "Optimus";
    return "Main";
  };

  const currentScreen = getCurrentScreen();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentScreen === "Auth" ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      ) : currentScreen === "PreApprove" ? (
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
      ) : currentScreen === "IlliquidAssets" ? (
        <Stack.Screen
          name="IlliquidAssets"
          component={IlliquidAssetsScreen}
          options={{
            ...getCommonScreenOptions({ theme, isDark }),
            headerShown: true,
            headerTitle: "Illiquid Assets",
            headerBackVisible: false,
          }}
        />
      ) : currentScreen === "LedgerToken" ? (
        <Stack.Screen
          name="LedgerToken"
          component={LedgerTokenScreen}
          options={{
            ...getCommonScreenOptions({ theme, isDark }),
            headerShown: true,
            headerTitle: "LedgerToken",
            headerBackVisible: false,
          }}
        />
      ) : currentScreen === "Optimus" ? (
        <Stack.Screen
          name="Optimus"
          component={OptimusScreen}
          options={{
            ...getCommonScreenOptions({ theme, isDark }),
            headerShown: true,
            headerTitle: "Optimus",
            headerBackVisible: false,
          }}
        />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
