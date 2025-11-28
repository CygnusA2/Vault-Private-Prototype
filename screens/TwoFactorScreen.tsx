import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  FadeIn,
  FadeInUp,
  SlideInUp,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";

type TwoFactorScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "TwoFactor">;
};

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function TwoFactorScreen({ navigation }: TwoFactorScreenProps) {
  const insets = useSafeAreaInsets();
  const { login, userData } = useAuth();
  const [code] = useState(generateCode());
  const [status, setStatus] = useState<"receiving" | "verifying" | "verified">("receiving");
  const digitOpacities = useRef(
    code.split("").map(() => useSharedValue(0))
  ).current;

  useEffect(() => {
    code.split("").forEach((_, index) => {
      digitOpacities[index].value = withDelay(
        index * 150,
        withTiming(1, { duration: 300 })
      );
    });

    const timer1 = setTimeout(() => {
      setStatus("verifying");
    }, 1500);

    const timer2 = setTimeout(() => {
      setStatus("verified");
    }, 2500);

    const timer3 = setTimeout(() => {
      login();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.headerContainer}>
          {status === "verified" ? (
            <View style={styles.successIcon}>
              <Feather name="check-circle" size={64} color={Colors.dark.success} />
            </View>
          ) : (
            <View style={styles.codeIcon}>
              <Feather name="lock" size={48} color={Colors.dark.primary} />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.codeContainer}>
          <View style={styles.codeBoxes}>
            {code.split("").map((digit, index) => {
              const animatedStyle = useAnimatedStyle(() => ({
                opacity: digitOpacities[index].value,
                transform: [
                  {
                    translateY: (1 - digitOpacities[index].value) * 20,
                  },
                ],
              }));

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.codeBox,
                    status === "verified" && styles.codeBoxSuccess,
                    animatedStyle,
                  ]}
                >
                  <ThemedText type="h2" style={styles.codeDigit}>
                    {digit}
                  </ThemedText>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.statusContainer}>
          {status === "receiving" ? (
            <>
              <ThemedText type="h3" style={styles.statusText}>
                Auto-filling code
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.statusSubtext, { color: Colors.dark.textSecondary }]}
              >
                Code sent via SMS to {userData?.phoneNumber}
              </ThemedText>
            </>
          ) : status === "verifying" ? (
            <>
              <ThemedText type="h3" style={[styles.statusText, { color: Colors.dark.primary }]}>
                Verifying...
              </ThemedText>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
              </View>
            </>
          ) : (
            <Animated.View entering={SlideInUp.duration(400)}>
              <ThemedText type="h3" style={[styles.statusText, { color: Colors.dark.success }]}>
                Authentication Successful
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.statusSubtext, { color: Colors.dark.textSecondary }]}
              >
                Redirecting to your dashboard...
              </ThemedText>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.duration(600).delay(600)} style={styles.footer}>
        <View style={styles.securityBadge}>
          <Feather name="shield" size={16} color={Colors.dark.primary} />
          <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
            Two-Factor Authentication
          </ThemedText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    marginBottom: Spacing["3xl"],
  },
  codeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.dark.backgroundDefault,
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  codeContainer: {
    marginBottom: Spacing["3xl"],
  },
  codeBoxes: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  codeBox: {
    width: 48,
    height: 60,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  codeBoxSuccess: {
    borderColor: Colors.dark.success,
  },
  codeDigit: {
    color: Colors.dark.text,
    fontWeight: "700",
  },
  statusContainer: {
    alignItems: "center",
  },
  statusText: {
    marginBottom: Spacing.sm,
    color: Colors.dark.text,
    textAlign: "center",
  },
  statusSubtext: {
    textAlign: "center",
  },
  loadingDots: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  dotActive: {
    backgroundColor: Colors.dark.primary,
  },
  footer: {
    alignItems: "center",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.full,
  },
});
