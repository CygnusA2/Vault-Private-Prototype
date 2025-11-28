import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";

type FaceRecognitionScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "FaceRecognition">;
};

export default function FaceRecognitionScreen({ navigation }: FaceRecognitionScreenProps) {
  const insets = useSafeAreaInsets();
  const { userData } = useAuth();
  const [status, setStatus] = useState<"scanning" | "recognized">("scanning");
  const pulseScale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.5);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );

    ringScale.value = withRepeat(
      withTiming(1.5, { duration: 1500 }),
      -1,
      false
    );

    ringOpacity.value = withRepeat(
      withTiming(0, { duration: 1500 }),
      -1,
      false
    );

    const timer = setTimeout(() => {
      setStatus("recognized");
      setTimeout(() => {
        navigation.navigate("TwoFactor");
      }, 1500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

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
        <Animated.View entering={FadeIn.duration(600)} style={styles.scannerContainer}>
          <Animated.View style={[styles.ring, ringAnimatedStyle]} />
          <Animated.View style={[styles.ovalFrame, pulseAnimatedStyle]}>
            {status === "recognized" ? (
              <Animated.View entering={FadeIn.duration(400)}>
                <Feather name="check" size={80} color={Colors.dark.success} />
              </Animated.View>
            ) : (
              <Feather name="user" size={80} color={Colors.dark.primary} />
            )}
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.statusContainer}>
          {status === "scanning" ? (
            <>
              <ThemedText type="h2" style={styles.statusText}>
                Recognizing...
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.statusSubtext, { color: Colors.dark.textSecondary }]}
              >
                Please look at the camera
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText type="h2" style={[styles.statusText, { color: Colors.dark.success }]}>
                Welcome back
              </ThemedText>
              <ThemedText type="h3" style={styles.userName}>
                {userData?.firstName} {userData?.lastName}
              </ThemedText>
            </>
          )}
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.duration(600).delay(500)} style={styles.footer}>
        <View style={styles.securityBadge}>
          <Feather name="shield" size={16} color={Colors.dark.primary} />
          <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
            Secured by Vault Private
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
  scannerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  ring: {
    position: "absolute",
    width: 240,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  ovalFrame: {
    width: 200,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
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
  userName: {
    color: Colors.dark.primary,
    textAlign: "center",
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
