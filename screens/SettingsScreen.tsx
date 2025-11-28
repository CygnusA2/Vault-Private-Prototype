import React, { useState } from "react";
import { View, StyleSheet, Pressable, Switch, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  isDanger?: boolean;
}

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout },
      ]
    );
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(600).delay(100)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          SECURITY
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="shield"
            label="Two-Factor Authentication"
            hasToggle
            toggleValue={twoFactorEnabled}
            onToggle={setTwoFactorEnabled}
          />
          <SettingItem
            icon="smartphone"
            label="Biometric Login"
            hasToggle
            toggleValue={biometricsEnabled}
            onToggle={setBiometricsEnabled}
          />
          <SettingItem
            icon="lock"
            label="Change PIN"
            onPress={() => {}}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          PROFILE
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="user"
            label="Personal Details"
            onPress={() => {}}
          />
          <SettingItem
            icon="file-text"
            label="Documents"
            onPress={() => {}}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          PREFERENCES
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="bell"
            label="Notifications"
            hasToggle
            toggleValue={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <SettingItem
            icon="globe"
            label="Language"
            value="English"
            onPress={() => {}}
          />
          <SettingItem
            icon="dollar-sign"
            label="Currency"
            value="USD"
            onPress={() => {}}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(400)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          ABOUT
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="file"
            label="Terms of Service"
            onPress={() => {}}
          />
          <SettingItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <SettingItem
            icon="info"
            label="App Version"
            value="1.0.0"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(500)}>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="log-out"
            label="Sign Out"
            onPress={handleLogout}
            isDanger
          />
        </View>
      </Animated.View>
    </ScreenScrollView>
  );
}

function SettingItem({
  icon,
  label,
  value,
  hasToggle,
  toggleValue,
  onToggle,
  onPress,
  isDanger,
}: SettingItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && onPress && styles.settingItemPressed,
      ]}
      onPress={onPress}
      disabled={!onPress && !hasToggle}
    >
      <View
        style={[
          styles.settingIconContainer,
          isDanger && styles.settingIconContainerDanger,
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={isDanger ? Colors.dark.error : Colors.dark.primary}
        />
      </View>
      <ThemedText
        type="body"
        style={[styles.settingLabel, isDanger && styles.settingLabelDanger]}
      >
        {label}
      </ThemedText>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{
            false: Colors.dark.backgroundTertiary,
            true: Colors.dark.primary,
          }}
          thumbColor={Colors.dark.text}
        />
      ) : value ? (
        <ThemedText type="body" style={{ color: Colors.dark.textSecondary }}>
          {value}
        </ThemedText>
      ) : onPress ? (
        <Feather name="chevron-right" size={20} color={Colors.dark.textTertiary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing["2xl"],
  },
  sectionLabel: {
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  settingsGroup: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingItemPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  settingIconContainerDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  settingLabel: {
    flex: 1,
    color: Colors.dark.text,
  },
  settingLabelDanger: {
    color: Colors.dark.error,
  },
});
