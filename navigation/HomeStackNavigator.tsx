import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "@/screens/DashboardScreen";
import PreApproveScreen from "@/screens/PreApproveScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { Colors } from "@/constants/theme";

export type HomeStackParamList = {
  Dashboard: undefined;
  PreApprove: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Vault Private" />,
        }}
      />
      <Stack.Screen
        name="PreApprove"
        component={PreApproveScreen}
        options={{
          headerTitle: "Pre-Approve",
          headerBackTitle: "Back",
          headerTintColor: Colors.dark.text,
        }}
      />
    </Stack.Navigator>
  );
}
