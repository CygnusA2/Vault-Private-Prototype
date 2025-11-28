import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
  cancelAnimation,
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

const SCAN_DURATION = 1200;
const OVAL_HEIGHT = 260;
const SCAN_LINE_HEIGHT = 4;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KYCSelfieScreen({ navigation }: KYCSelfieScreenProps) {
  const { setUserData } = useAuth();
  const [isCaptured, setIsCaptured] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const buttonScale = useSharedValue(1);
  const scanLinePosition = useSharedValue(0);
  const scanLineOpacity = useSharedValue(0);
  const frameGlow = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      scanLineOpacity.value = 1;
      scanLinePosition.value = 0;
      
      scanLinePosition.value = withRepeat(
        withSequence(
          withTiming(OVAL_HEIGHT - SCAN_LINE_HEIGHT, {
            duration: SCAN_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: SCAN_DURATION,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );

      frameGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.4, { duration: 800 })
        ),
        -1,
        false
      );

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setScanProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 60);

      const timer = setTimeout(() => {
        cancelAnimation(scanLinePosition);
        cancelAnimation(frameGlow);
        scanLineOpacity.value = withTiming(0, { duration: 300 });
        setIsScanning(false);
        setIsCaptured(true);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isScanning]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePosition.value }],
    opacity: scanLineOpacity.value,
  }));

  const frameGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: frameGlow.value * 0.8,
  }));

  const handleCapture = () => {
    setScanProgress(0);
    setIsScanning(true);
  };

  const handleRetake = () => {
    setIsCaptured(false);
    setScanProgress(0);
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
          Position your face within the frame for biometric scanning
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.cameraContainer}>
        <View style={styles.cameraFrame}>
          <Animated.View
            style={[
              styles.ovalFrame,
              isScanning && styles.ovalFrameScanning,
              isCaptured && styles.ovalFrameSuccess,
              frameGlowStyle,
            ]}
          >
            {isCaptured ? (
              <View style={styles.successOverlay}>
                <Feather name="check-circle" size={64} color={Colors.dark.success} />
                <ThemedText type="h4" style={styles.successText}>
                  Scan Complete
                </ThemedText>
              </View>
            ) : isScanning ? (
              <View style={styles.scanningContainer}>
                <Feather name="user" size={80} color={Colors.dark.textSecondary} />
                
                <Animated.View style={[styles.scanLine, scanLineAnimatedStyle]}>
                  <View style={styles.scanLineGlow} />
                  <View style={styles.scanLineCore} />
                  <View style={styles.scanLineGlow} />
                </Animated.View>
              </View>
            ) : (
              <Feather name="user" size={80} color={Colors.dark.textTertiary} />
            )}
          </Animated.View>

          {isScanning ? (
            <View style={styles.scanStatusContainer}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${scanProgress}%` }]} />
              </View>
              <ThemedText type="small" style={styles.scanningText}>
                Scanning face... {scanProgress}%
              </ThemedText>
            </View>
          ) : !isCaptured ? (
            <View style={styles.guidelines}>
              <ThemedText type="small" style={styles.guidelineText}>
                Position your face within the oval
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {!isCaptured && !isScanning ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.captureButtonContainer}>
          <Pressable
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>
          <ThemedText type="small" style={{ color: Colors.dark.textSecondary, marginTop: Spacing.md }}>
            Tap to start face scan
          </ThemedText>
        </Animated.View>
      ) : isCaptured ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.retakeContainer}>
          <Pressable style={styles.retakeButton} onPress={handleRetake}>
            <Feather name="refresh-cw" size={20} color={Colors.dark.primary} />
            <ThemedText type="body" style={{ color: Colors.dark.primary }}>
              Retake Photo
            </ThemedText>
          </Pressable>
        </Animated.View>
      ) : null}

      <View style={styles.spacer} />

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
        <AnimatedPressable
          onPress={handleContinue}
          disabled={isScanning}
          onPressIn={() => {
            buttonScale.value = withSpring(0.97);
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1);
          }}
          style={[
            styles.continueButton, 
            isScanning && styles.continueButtonDisabled,
            buttonAnimatedStyle
          ]}
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
    height: OVAL_HEIGHT,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    overflow: "hidden",
    position: "relative",
  },
  ovalFrameScanning: {
    borderColor: Colors.dark.primary,
    borderStyle: "solid",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  ovalFrameSuccess: {
    borderColor: Colors.dark.success,
    borderStyle: "solid",
  },
  successOverlay: {
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  successText: {
    color: Colors.dark.success,
  },
  scanningContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCAN_LINE_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  scanLineCore: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.dark.primary,
  },
  scanLineGlow: {
    width: 20,
    height: SCAN_LINE_HEIGHT,
    backgroundColor: Colors.dark.primary,
    opacity: 0.3,
  },
  scanStatusContainer: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
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
