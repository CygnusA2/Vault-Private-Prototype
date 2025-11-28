import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
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

type KYCBiometricScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "KYCBiometric">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const IRIS_SCAN_DURATION = 800;
const IRIS_HEIGHT = 120;
const SCAN_LINE_HEIGHT = 3;

const FINGERPRINT_FINGERS = [
  { id: "rightIndex", name: "Right Index", scansRequired: 4 },
  { id: "leftIndex", name: "Left Index", scansRequired: 4 },
  { id: "rightThumb", name: "Right Thumb", scansRequired: 4 },
  { id: "leftThumb", name: "Left Thumb", scansRequired: 4 },
];

export default function KYCBiometricScreen({ navigation }: KYCBiometricScreenProps) {
  const { setUserData } = useAuth();
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [irisEnabled, setIrisEnabled] = useState(false);
  const [dowJonesEnabled, setDowJonesEnabled] = useState(false);
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(false);
  const [irisEnrolled, setIrisEnrolled] = useState(false);
  const [irisScanning, setIrisScanning] = useState(false);
  const [irisScanProgress, setIrisScanProgress] = useState(0);
  const [dowJonesChecked, setDowJonesChecked] = useState(false);
  const [dowJonesChecking, setDowJonesChecking] = useState(false);
  const [lsegEnabled, setLsegEnabled] = useState(false);
  const [lsegChecked, setLsegChecked] = useState(false);
  const [lsegChecking, setLsegChecking] = useState(false);
  
  const [currentFingerIndex, setCurrentFingerIndex] = useState(0);
  const [fingerScans, setFingerScans] = useState<{ [key: string]: number }>({
    rightIndex: 0,
    leftIndex: 0,
    rightThumb: 0,
    leftThumb: 0,
  });
  const [isScanning, setIsScanning] = useState(false);
  
  const buttonScale = useSharedValue(1);
  const lsegPulseAnim = useSharedValue(1);
  const pulseAnim = useSharedValue(1);
  const fingerprintScale = useSharedValue(1);
  const fingerprintGlow = useSharedValue(0);
  const irisScanLinePosition = useSharedValue(0);
  const irisScanLineOpacity = useSharedValue(0);
  const irisFrameGlow = useSharedValue(0);

  const currentFinger = FINGERPRINT_FINGERS[currentFingerIndex];
  const totalScansCompleted = Object.values(fingerScans).reduce((a, b) => a + b, 0);
  const totalScansRequired = FINGERPRINT_FINGERS.reduce((a, b) => a + b.scansRequired, 0);

  useEffect(() => {
    if (dowJonesChecking) {
      pulseAnim.value = withRepeat(
        withTiming(1.05, { duration: 600 }),
        -1,
        true
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [dowJonesChecking]);

  useEffect(() => {
    if (lsegChecking) {
      lsegPulseAnim.value = withRepeat(
        withTiming(1.05, { duration: 600 }),
        -1,
        true
      );
    } else {
      lsegPulseAnim.value = 1;
    }
  }, [lsegChecking]);

  useEffect(() => {
    if (irisScanning) {
      irisScanLineOpacity.value = 1;
      irisScanLinePosition.value = 0;

      irisScanLinePosition.value = withRepeat(
        withSequence(
          withTiming(IRIS_HEIGHT - SCAN_LINE_HEIGHT, {
            duration: IRIS_SCAN_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: IRIS_SCAN_DURATION,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );

      irisFrameGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 600 })
        ),
        -1,
        false
      );

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 4;
        setIrisScanProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 60);

      const timer = setTimeout(() => {
        cancelAnimation(irisScanLinePosition);
        cancelAnimation(irisFrameGlow);
        irisScanLineOpacity.value = withTiming(0, { duration: 300 });
        setIrisScanning(false);
        setIrisEnrolled(true);
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [irisScanning]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const lsegPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lsegPulseAnim.value }],
  }));

  const irisScanLineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: irisScanLinePosition.value }],
    opacity: irisScanLineOpacity.value,
  }));

  const irisFrameGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: irisFrameGlow.value * 0.8,
  }));

  const fingerprintAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fingerprintScale.value }],
    shadowOpacity: fingerprintGlow.value,
  }));

  const handleFingerprintToggle = (value: boolean) => {
    setFingerprintEnabled(value);
    if (!value) {
      setFingerprintEnrolled(false);
      setCurrentFingerIndex(0);
      setFingerScans({
        rightIndex: 0,
        leftIndex: 0,
        rightThumb: 0,
        leftThumb: 0,
      });
    }
  };

  const handleFingerprintTap = () => {
    if (isScanning || fingerprintEnrolled || !fingerprintEnabled) return;
    
    setIsScanning(true);
    
    fingerprintScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1.05, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    
    fingerprintGlow.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(0, { duration: 400 })
    );
    
    setTimeout(() => {
      const newScans = { ...fingerScans };
      const fingerId = currentFinger.id;
      newScans[fingerId] = (newScans[fingerId] || 0) + 1;
      setFingerScans(newScans);
      
      if (newScans[fingerId] >= currentFinger.scansRequired) {
        if (currentFingerIndex < FINGERPRINT_FINGERS.length - 1) {
          setCurrentFingerIndex(currentFingerIndex + 1);
        } else {
          setFingerprintEnrolled(true);
        }
      }
      
      setIsScanning(false);
    }, 300);
  };

  const handleIrisToggle = (value: boolean) => {
    setIrisEnabled(value);
    if (value && !irisEnrolled) {
      setIrisScanProgress(0);
      setIrisScanning(true);
    } else if (!value) {
      setIrisEnrolled(false);
      setIrisScanning(false);
      setIrisScanProgress(0);
    }
  };

  const handleDowJonesToggle = (value: boolean) => {
    setDowJonesEnabled(value);
    if (value) {
      setDowJonesChecking(true);
      setTimeout(() => {
        setDowJonesChecking(false);
        setDowJonesChecked(true);
      }, 2500);
    } else {
      setDowJonesChecked(false);
    }
  };

  const handleLsegToggle = (value: boolean) => {
    setLsegEnabled(value);
    if (value) {
      setLsegChecking(true);
      setTimeout(() => {
        setLsegChecking(false);
        setLsegChecked(true);
      }, 2800);
    } else {
      setLsegChecked(false);
    }
  };

  const handleContinue = () => {
    setUserData({
      fingerprintEnabled: fingerprintEnrolled,
      irisEnabled: irisEnrolled,
      dowJonesChecked: dowJonesChecked,
    });
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
                  ? "All fingerprints enrolled"
                  : fingerprintEnabled
                  ? `Scanning: ${currentFinger.name}`
                  : "Tap to enroll your fingerprints"}
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
            <View style={styles.fingerprintScanSection}>
              <View style={styles.fingerprintRequirements}>
                <ThemedText type="small" style={styles.requirementsTitle}>
                  ENROLLMENT REQUIREMENTS
                </ThemedText>
                <View style={styles.requirementsTable}>
                  {FINGERPRINT_FINGERS.map((finger) => (
                    <View key={finger.id} style={styles.requirementRow}>
                      <View style={styles.requirementFinger}>
                        <Feather 
                          name={fingerScans[finger.id] >= finger.scansRequired ? "check-circle" : "circle"} 
                          size={14} 
                          color={fingerScans[finger.id] >= finger.scansRequired ? Colors.dark.success : Colors.dark.textTertiary} 
                        />
                        <ThemedText 
                          type="small" 
                          style={[
                            styles.requirementText,
                            finger.id === currentFinger.id && styles.requirementTextActive,
                            fingerScans[finger.id] >= finger.scansRequired && styles.requirementTextComplete,
                          ]}
                        >
                          {finger.name}
                        </ThemedText>
                      </View>
                      <ThemedText 
                        type="small" 
                        style={[
                          styles.requirementCount,
                          fingerScans[finger.id] >= finger.scansRequired && styles.requirementCountComplete,
                        ]}
                      >
                        {fingerScans[finger.id]}/{finger.scansRequired}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
              
              <Pressable onPress={handleFingerprintTap} disabled={isScanning}>
                <Animated.View 
                  style={[
                    styles.fingerprintScanArea,
                    fingerprintAnimStyle,
                  ]}
                >
                  <View style={styles.fingerprintIcon}>
                    <Feather 
                      name="target" 
                      size={60} 
                      color={isScanning ? Colors.dark.success : Colors.dark.primary} 
                    />
                  </View>
                  <ThemedText type="small" style={styles.fingerprintInstructions}>
                    {isScanning ? "Scanning..." : `Touch here with your ${currentFinger.name}`}
                  </ThemedText>
                  <ThemedText type="small" style={styles.fingerprintProgress}>
                    Scan {fingerScans[currentFinger.id] + 1} of {currentFinger.scansRequired}
                  </ThemedText>
                </Animated.View>
              </Pressable>
              
              <View style={styles.totalProgressContainer}>
                <View style={styles.totalProgressBar}>
                  <View 
                    style={[
                      styles.totalProgressFill, 
                      { width: `${(totalScansCompleted / totalScansRequired) * 100}%` }
                    ]} 
                  />
                </View>
                <ThemedText type="small" style={styles.totalProgressText}>
                  Total: {totalScansCompleted} / {totalScansRequired} scans
                </ThemedText>
              </View>
            </View>
          ) : null}
          
          {fingerprintEnrolled ? (
            <View style={styles.enrolledSuccessContainer}>
              <Feather name="check-circle" size={18} color={Colors.dark.success} />
              <ThemedText type="small" style={{ color: Colors.dark.success }}>
                All 4 fingerprints enrolled ({totalScansRequired} scans completed)
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
                  : irisScanning
                  ? "Scanning iris..."
                  : "Use iris scan for enhanced security"}
              </ThemedText>
            </View>
            <Switch
              value={irisEnabled}
              onValueChange={handleIrisToggle}
              disabled={irisScanning}
              trackColor={{
                false: Colors.dark.backgroundTertiary,
                true: Colors.dark.primary,
              }}
              thumbColor={Colors.dark.text}
            />
          </View>
          
          {irisScanning ? (
            <View style={styles.irisScanContainer}>
              <Animated.View
                style={[
                  styles.eyeFrame,
                  styles.eyeFrameScanning,
                  irisFrameGlowStyle,
                ]}
              >
                <View style={styles.eyeScanningContainer}>
                  <View style={styles.eyeballOuter}>
                    <View style={styles.eyeballInner}>
                      <View style={styles.pupil} />
                    </View>
                  </View>
                  
                  <Animated.View style={[styles.irisScanLine, irisScanLineAnimatedStyle]}>
                    <View style={styles.scanLineGlow} />
                    <View style={styles.scanLineCore} />
                    <View style={styles.scanLineGlow} />
                  </Animated.View>
                </View>
              </Animated.View>
              
              <View style={styles.scanProgressContainer}>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${irisScanProgress}%` }]} />
                </View>
                <ThemedText type="small" style={{ color: Colors.dark.primary }}>
                  Scanning iris... {irisScanProgress}%
                </ThemedText>
              </View>
            </View>
          ) : irisEnrolled ? (
            <View style={styles.enrolledSuccessContainer}>
              <Feather name="check-circle" size={18} color={Colors.dark.success} />
              <ThemedText type="small" style={{ color: Colors.dark.success }}>
                Iris pattern captured and encrypted
              </ThemedText>
            </View>
          ) : null}
        </View>

        <Animated.View 
          entering={FadeIn.duration(600).delay(400)}
          style={[styles.biometricCard, styles.dowJonesCard]}
        >
          <View style={styles.biometricHeader}>
            <Animated.View
              style={[
                styles.iconContainer,
                dowJonesChecked && styles.iconContainerActive,
                dowJonesChecking && styles.iconContainerChecking,
                pulseStyle,
              ]}
            >
              <Feather
                name="shield"
                size={28}
                color={
                  dowJonesChecked
                    ? Colors.dark.success
                    : dowJonesChecking
                    ? Colors.dark.primary
                    : Colors.dark.textSecondary
                }
              />
            </Animated.View>
            <View style={styles.biometricInfo}>
              <ThemedText type="h4" style={styles.biometricTitle}>
                Dow Jones Risk & Compliance
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.textSecondary }}
              >
                {dowJonesChecked
                  ? "Verification complete - No issues found"
                  : dowJonesChecking
                  ? "Running compliance check..."
                  : "Deep due diligence verification"}
              </ThemedText>
            </View>
            <Switch
              value={dowJonesEnabled}
              onValueChange={handleDowJonesToggle}
              disabled={dowJonesChecking}
              trackColor={{
                false: Colors.dark.backgroundTertiary,
                true: Colors.dark.primary,
              }}
              thumbColor={Colors.dark.text}
            />
          </View>
          
          <View style={styles.dowJonesDescription}>
            <Feather name="info" size={16} color={Colors.dark.textTertiary} />
            <ThemedText
              type="small"
              style={styles.dowJonesDescriptionText}
            >
              We will securely check your provided data for deep due diligence against global sanctions and watchlists in compliance with international banking regulations
            </ThemedText>
          </View>

          {dowJonesChecking ? (
            <View style={styles.checkingContainer}>
              <View style={styles.checkingProgress}>
                <View style={styles.checkingDot} />
                <View style={[styles.checkingDot, styles.checkingDotDelay1]} />
                <View style={[styles.checkingDot, styles.checkingDotDelay2]} />
              </View>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.primary }}
              >
                Checking global databases...
              </ThemedText>
            </View>
          ) : null}

          {dowJonesChecked ? (
            <View style={styles.successBadge}>
              <Feather name="check-circle" size={18} color={Colors.dark.success} />
              <ThemedText
                type="small"
                style={{ color: Colors.dark.success }}
              >
                Cleared - No matches found in global watchlists
              </ThemedText>
            </View>
          ) : null}
        </Animated.View>

        <Animated.View 
          entering={FadeIn.duration(600).delay(500)}
          style={[styles.biometricCard, styles.lsegCard]}
        >
          <View style={styles.biometricHeader}>
            <Animated.View
              style={[
                styles.iconContainer,
                lsegChecked && styles.iconContainerActive,
                lsegChecking && styles.iconContainerLsegChecking,
                lsegPulseStyle,
              ]}
            >
              <Feather
                name="globe"
                size={28}
                color={
                  lsegChecked
                    ? Colors.dark.success
                    : lsegChecking
                    ? "#3B82F6"
                    : Colors.dark.textSecondary
                }
              />
            </Animated.View>
            <View style={styles.biometricInfo}>
              <ThemedText type="h4" style={styles.biometricTitle}>
                LSEG World-Check
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.textSecondary }}
              >
                {lsegChecked
                  ? "Verification complete - Compliant"
                  : lsegChecking
                  ? "Running global compliance check..."
                  : "Deeper due diligence verification"}
              </ThemedText>
            </View>
            <Switch
              value={lsegEnabled}
              onValueChange={handleLsegToggle}
              disabled={lsegChecking}
              trackColor={{
                false: Colors.dark.backgroundTertiary,
                true: "#3B82F6",
              }}
              thumbColor={Colors.dark.text}
            />
          </View>
          
          <View style={styles.lsegDescription}>
            <Feather name="info" size={16} color={Colors.dark.textTertiary} />
            <ThemedText
              type="small"
              style={styles.lsegDescriptionText}
            >
              We securely check your provided data against LSEG's global sanctions, PEP, and regulatory watchlists to ensure compliance with international banking standards.
            </ThemedText>
          </View>

          {lsegChecking ? (
            <View style={styles.lsegCheckingContainer}>
              <View style={styles.checkingProgress}>
                <View style={styles.lsegCheckingDot} />
                <View style={[styles.lsegCheckingDot, styles.lsegCheckingDotDelay1]} />
                <View style={[styles.lsegCheckingDot, styles.lsegCheckingDotDelay2]} />
              </View>
              <ThemedText
                type="small"
                style={{ color: "#3B82F6" }}
              >
                Checking LSEG World-Check database...
              </ThemedText>
            </View>
          ) : null}

          {lsegChecked ? (
            <View style={styles.lsegSuccessBadge}>
              <Feather name="check-circle" size={18} color={Colors.dark.success} />
              <ThemedText
                type="small"
                style={{ color: Colors.dark.success }}
              >
                Compliant - No matches in sanctions, PEP, or regulatory lists
              </ThemedText>
            </View>
          ) : null}
        </Animated.View>
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
  dowJonesCard: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(201, 169, 97, 0.03)",
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
  iconContainerChecking: {
    backgroundColor: "rgba(201, 169, 97, 0.15)",
  },
  biometricInfo: {
    flex: 1,
  },
  biometricTitle: {
    marginBottom: Spacing.xs,
    color: Colors.dark.text,
  },
  fingerprintScanSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    gap: Spacing.lg,
  },
  fingerprintRequirements: {
    gap: Spacing.md,
  },
  requirementsTitle: {
    color: Colors.dark.textTertiary,
    letterSpacing: 1.5,
    fontSize: 10,
    fontWeight: "600",
  },
  requirementsTable: {
    gap: Spacing.sm,
  },
  requirementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  requirementFinger: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  requirementText: {
    color: Colors.dark.textSecondary,
  },
  requirementTextActive: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  requirementTextComplete: {
    color: Colors.dark.success,
  },
  requirementCount: {
    color: Colors.dark.textTertiary,
    fontFamily: "monospace",
  },
  requirementCountComplete: {
    color: Colors.dark.success,
  },
  fingerprintScanArea: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    borderStyle: "dashed",
    backgroundColor: "rgba(201, 169, 97, 0.05)",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
  fingerprintIcon: {
    marginBottom: Spacing.md,
  },
  fingerprintInstructions: {
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  fingerprintProgress: {
    color: Colors.dark.textTertiary,
    textAlign: "center",
  },
  totalProgressContainer: {
    gap: Spacing.sm,
  },
  totalProgressBar: {
    height: 6,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  totalProgressFill: {
    height: "100%",
    backgroundColor: Colors.dark.success,
    borderRadius: 3,
  },
  totalProgressText: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
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
  irisScanContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    alignItems: "center",
    gap: Spacing.lg,
  },
  eyeFrame: {
    width: 160,
    height: IRIS_HEIGHT,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  eyeFrameScanning: {
    borderColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  eyeScanningContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  eyeballOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.dark.textTertiary,
  },
  eyeballInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5B3A1D",
    justifyContent: "center",
    alignItems: "center",
  },
  pupil: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  irisScanLine: {
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
    width: 15,
    height: SCAN_LINE_HEIGHT,
    backgroundColor: Colors.dark.primary,
    opacity: 0.3,
  },
  scanProgressContainer: {
    width: "100%",
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
  enrolledSuccessContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  dowJonesDescription: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  dowJonesDescriptionText: {
    flex: 1,
    color: Colors.dark.textTertiary,
    lineHeight: 18,
  },
  checkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: "rgba(201, 169, 97, 0.08)",
    borderRadius: BorderRadius.sm,
  },
  checkingProgress: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  checkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
    opacity: 0.4,
  },
  checkingDotDelay1: {
    opacity: 0.6,
  },
  checkingDotDelay2: {
    opacity: 1,
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: BorderRadius.sm,
  },
  lsegCard: {
    borderColor: "#3B82F6",
    backgroundColor: "rgba(59, 130, 246, 0.03)",
  },
  iconContainerLsegChecking: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  lsegDescription: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  lsegDescriptionText: {
    flex: 1,
    color: Colors.dark.textTertiary,
    lineHeight: 18,
  },
  lsegCheckingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: BorderRadius.sm,
  },
  lsegCheckingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    opacity: 0.4,
  },
  lsegCheckingDotDelay1: {
    opacity: 0.6,
  },
  lsegCheckingDotDelay2: {
    opacity: 1,
  },
  lsegSuccessBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: BorderRadius.sm,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing["2xl"],
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
});
