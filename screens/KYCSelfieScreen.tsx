import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { AuthScreenScrollView } from "@/components/AuthScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";
import ProgressStepper from "@/components/ProgressStepper";

type KYCSelfieScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "KYCSelfie">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KYCSelfieScreen({ navigation }: KYCSelfieScreenProps) {
  const { setUserData } = useAuth();
  const [isCaptured, setIsCaptured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isCapturing) {
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 500 }),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isCapturing]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      setIsCaptured(true);
    }, 2000);
  };

  const handleRetake = () => {
    setIsCaptured(false);
  };

  const handleContinue = () => {
    setUserData({ selfieUploaded: true });
    navigation.navigate("KYCBiometric");
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <ProgressStepper currentStep={3} totalSteps={5} />

      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Photo Verification
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          Take a clear selfie for identity verification. Position your face within the oval
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.cameraContainer}>
        <View style={styles.cameraFrame}>
          <Animated.View
            style={[
              styles.ovalFrame,
              isCapturing && styles.ovalFrameScanning,
              isCaptured && styles.ovalFrameSuccess,
              pulseAnimatedStyle,
            ]}
          >
            {isCaptured ? (
              <View style={styles.successOverlay}>
                <Feather name="check-circle" size={64} color={Colors.dark.success} />
              </View>
            ) : isCapturing ? (
              <View style={styles.scanningOverlay}>
                <Feather name="loader" size={48} color={Colors.dark.primary} />
                <ThemedText type="small" style={styles.scanningText}>
                  Scanning...
                </ThemedText>
              </View>
            ) : (
              <Feather name="user" size={80} color={Colors.dark.textTertiary} />
            )}
          </Animated.View>

          {!isCaptured && !isCapturing ? (
            <View style={styles.guidelines}>
              <ThemedText type="small" style={styles.guidelineText}>
                Position your face within the oval
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {!isCaptured ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.captureButtonContainer}>
          <Pressable
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={styles.retakeContainer}>
          <Pressable style={styles.retakeButton} onPress={handleRetake}>
            <Feather name="refresh-cw" size={20} color={Colors.dark.primary} />
            <ThemedText type="body" style={{ color: Colors.dark.primary }}>
              Retake Photo
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.spacer} />

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
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
      </Animated.View>
    </AuthScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    lineHeight: 22,
  },
  cameraContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  cameraFrame: {
    width: 280,
    height: 360,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ovalFrame: {
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
  },
  ovalFrameScanning: {
    borderColor: Colors.dark.primary,
    borderStyle: "solid",
  },
  ovalFrameSuccess: {
    borderColor: Colors.dark.success,
    borderStyle: "solid",
  },
  successOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  scanningOverlay: {
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  scanningText: {
    color: Colors.dark.primary,
  },
  guidelines: {
    position: "absolute",
    bottom: Spacing.lg,
  },
  guidelineText: {
    color: Colors.dark.textTertiary,
    textAlign: "center",
  },
  captureButtonContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.dark.primary,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary,
  },
  retakeContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing["3xl"],
  },
  continueButton: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
  },
});
