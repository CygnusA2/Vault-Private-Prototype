import React, { useState } from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { AuthScreenScrollView } from "@/components/AuthScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";
import ProgressStepper from "@/components/ProgressStepper";

type KYCBiometricScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "KYCBiometric">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KYCBiometricScreen({ navigation }: KYCBiometricScreenProps) {
  const { setUserData } = useAuth();
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [irisEnabled, setIrisEnabled] = useState(false);
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(false);
  const [irisEnrolled, setIrisEnrolled] = useState(false);
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleFingerprintToggle = (value: boolean) => {
    setFingerprintEnabled(value);
    if (value) {
      setTimeout(() => setFingerprintEnrolled(true), 1000);
    } else {
      setFingerprintEnrolled(false);
    }
  };

  const handleIrisToggle = (value: boolean) => {
    setIrisEnabled(value);
    if (value) {
      setTimeout(() => setIrisEnrolled(true), 1000);
    } else {
      setIrisEnrolled(false);
    }
  };

  const handleContinue = () => {
    setUserData({
      fingerprintEnabled: fingerprintEnrolled,
      irisEnabled: irisEnrolled,
    });
    navigation.navigate("KYCAddress");
  };

  const handleSkip = () => {
    navigation.navigate("KYCAddress");
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <ProgressStepper currentStep={4} totalSteps={5} />

      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Biometric Security
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          Enable biometric authentication for quick and secure access to your account
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.biometricOptions}>
        <View style={styles.biometricCard}>
          <View style={styles.biometricHeader}>
            <View
              style={[
                styles.iconContainer,
                fingerprintEnrolled && styles.iconContainerActive,
              ]}
            >
              <Feather
                name="smartphone"
                size={28}
                color={
                  fingerprintEnrolled
                    ? Colors.dark.success
                    : Colors.dark.textSecondary
                }
              />
            </View>
            <View style={styles.biometricInfo}>
              <ThemedText type="h4" style={styles.biometricTitle}>
                Fingerprint
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.textSecondary }}
              >
                {fingerprintEnrolled
                  ? "Enrolled successfully"
                  : "Use your fingerprint to sign in"}
              </ThemedText>
            </View>
            <Switch
              value={fingerprintEnabled}
              onValueChange={handleFingerprintToggle}
              trackColor={{
                false: Colors.dark.backgroundTertiary,
                true: Colors.dark.primary,
              }}
              thumbColor={Colors.dark.text}
            />
          </View>
          {fingerprintEnabled && !fingerprintEnrolled ? (
            <View style={styles.enrollingContainer}>
              <Feather
                name="loader"
                size={20}
                color={Colors.dark.primary}
              />
              <ThemedText
                type="small"
                style={{ color: Colors.dark.primary }}
              >
                Enrolling fingerprint...
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.biometricCard}>
          <View style={styles.biometricHeader}>
            <View
              style={[
                styles.iconContainer,
                irisEnrolled && styles.iconContainerActive,
              ]}
            >
              <Feather
                name="eye"
                size={28}
                color={
                  irisEnrolled
                    ? Colors.dark.success
                    : Colors.dark.textSecondary
                }
              />
            </View>
            <View style={styles.biometricInfo}>
              <ThemedText type="h4" style={styles.biometricTitle}>
                Iris Recognition
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.textSecondary }}
              >
                {irisEnrolled
                  ? "Enrolled successfully"
                  : "Use iris scan for enhanced security"}
              </ThemedText>
            </View>
            <Switch
              value={irisEnabled}
              onValueChange={handleIrisToggle}
              trackColor={{
                false: Colors.dark.backgroundTertiary,
                true: Colors.dark.primary,
              }}
              thumbColor={Colors.dark.text}
            />
          </View>
          {irisEnabled && !irisEnrolled ? (
            <View style={styles.enrollingContainer}>
              <Feather
                name="loader"
                size={20}
                color={Colors.dark.primary}
              />
              <ThemedText
                type="small"
                style={{ color: Colors.dark.primary }}
              >
                Enrolling iris...
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Animated.View>

      <View style={styles.spacer} />

      <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.buttonContainer}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={() => {
            buttonScale.value = withSpring(0.97);
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1);
          }}
          style={[styles.continueButton, buttonAnimatedStyle]}
        >
          <ThemedText
            type="h4"
            style={[styles.buttonText, { color: Colors.dark.buttonText }]}
          >
            Continue
          </ThemedText>
        </AnimatedPressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <ThemedText type="body" style={{ color: Colors.dark.textSecondary }}>
            Skip for now
          </ThemedText>
        </Pressable>
      </Animated.View>
    </AuthScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing["3xl"],
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    lineHeight: 22,
  },
  biometricOptions: {
    gap: Spacing.lg,
  },
  biometricCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  biometricHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  iconContainerActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  biometricInfo: {
    flex: 1,
  },
  biometricTitle: {
    marginBottom: Spacing.xs,
    color: Colors.dark.text,
  },
  enrollingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing["3xl"],
  },
  buttonContainer: {
    gap: Spacing.lg,
  },
  continueButton: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});
