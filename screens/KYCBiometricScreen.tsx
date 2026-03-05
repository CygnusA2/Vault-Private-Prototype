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
  { id: "rightIndex", name: "Right Index", scansRequired: 1 },
  { id: "leftIndex", name: "Left Index", scansRequired: 1 },
  { id: "rightThumb", name: "Right Thumb", scansRequired: 1 },
  { id: "leftThumb", name: "Left Thumb", scansRequired: 1 },
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
  
  const [vaultPinStarted, setVaultPinStarted] = useState(false);
  const [vaultPinPhase, setVaultPinPhase] = useState(0);
  const [vaultPinComplete, setVaultPinComplete] = useState(false);
  const [rawBiometricData, setRawBiometricData] = useState("");
  const [encryptedHash, setEncryptedHash] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [testLoginActive, setTestLoginActive] = useState(false);
  const [testLoginSuccess, setTestLoginSuccess] = useState(false);
  
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

  const generateRandomHex = (length: number) => {
    const chars = "0123456789ABCDEF";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateLoginCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    if (vaultPinStarted && vaultPinPhase === 0) {
      setVaultPinPhase(1);
    }
  }, [vaultPinStarted]);

  useEffect(() => {
    if (vaultPinPhase === 1) {
      let dataInterval: NodeJS.Timeout;
      let charIndex = 0;
      const fullData = "8F2A9C1B4E7D3F5A2C8B1E9D4A6C3F7E2B5A8D1C4E9F2A7B3D6E8F1C2A5B7D9E4F6A8C1B3E5D7F9A2C4B6E8D1F3A5C7B9E2D4F6A8...";
      
      dataInterval = setInterval(() => {
        charIndex += 2;
        if (charIndex <= fullData.length) {
          setRawBiometricData(fullData.substring(0, charIndex));
        }
      }, 40);
      
      const timer = setTimeout(() => {
        clearInterval(dataInterval);
        setRawBiometricData(fullData);
        setVaultPinPhase(2);
      }, 2500);
      
      return () => {
        clearInterval(dataInterval);
        clearTimeout(timer);
      };
    }
  }, [vaultPinPhase]);

  useEffect(() => {
    if (vaultPinPhase === 2) {
      let hashInterval: NodeJS.Timeout;
      let charIndex = 0;
      const fullHash = "a7f2k9m1b4c6e8z3x5w7q2p0n8j1l4...";
      
      hashInterval = setInterval(() => {
        charIndex += 1;
        if (charIndex <= fullHash.length) {
          setEncryptedHash(fullHash.substring(0, charIndex));
        }
      }, 60);
      
      const timer = setTimeout(() => {
        clearInterval(hashInterval);
        setEncryptedHash(fullHash);
        setVaultPinPhase(3);
      }, 2000);
      
      return () => {
        clearInterval(hashInterval);
        clearTimeout(timer);
      };
    }
  }, [vaultPinPhase]);

  useEffect(() => {
    if (vaultPinPhase === 3) {
      const code = generateLoginCode();
      setLoginCode(code);
      
      const timer = setTimeout(() => {
        setVaultPinPhase(4);
        setVaultPinComplete(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [vaultPinPhase]);

  const handleVaultPinStart = () => {
    if (!vaultPinStarted) {
      setVaultPinStarted(true);
      setRawBiometricData("");
      setEncryptedHash("");
      setLoginCode("");
      setVaultPinPhase(0);
      setVaultPinComplete(false);
      setTestLoginSuccess(false);
    }
  };

  const handleTestLogin = () => {
    setTestLoginActive(true);
    
    setTimeout(() => {
      setTestLoginActive(false);
      setTestLoginSuccess(true);
    }, 1500);
  };

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
                All 4 fingerprints enrolled successfully
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

        <Animated.View 
          entering={FadeIn.duration(600).delay(600)}
          style={[styles.biometricCard, styles.vaultPinCard]}
        >
          <View style={styles.biometricHeader}>
            <View
              style={[
                styles.iconContainer,
                vaultPinComplete && styles.iconContainerActive,
                vaultPinStarted && !vaultPinComplete && styles.iconContainerVaultPinProcessing,
              ]}
            >
              <Feather
                name="key"
                size={28}
                color={
                  vaultPinComplete
                    ? Colors.dark.success
                    : vaultPinStarted
                    ? "#8B5CF6"
                    : Colors.dark.textSecondary
                }
              />
            </View>
            <View style={styles.biometricInfo}>
              <ThemedText type="h4" style={styles.biometricTitle}>
                Vault PIN
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.textSecondary }}
              >
                {vaultPinComplete
                  ? "Secure login code generated"
                  : vaultPinStarted
                  ? "Generating secure PIN..."
                  : "Obtain your secure login PIN"}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.vaultPinDescription}>
            <Feather name="info" size={16} color={Colors.dark.textTertiary} />
            <ThemedText
              type="small"
              style={styles.vaultPinDescriptionText}
            >
              Each biometric characteristic (fingerprint, iris, face) is converted through algorithms into a unique numerical representation - typically a string of encrypted numbers/data points that cannot be reverse-engineered back into the original image.
            </ThemedText>
          </View>

          {!vaultPinStarted ? (
            <Pressable 
              style={styles.vaultPinButton}
              onPress={handleVaultPinStart}
            >
              <Feather name="zap" size={20} color={Colors.dark.buttonText} />
              <ThemedText type="body" style={styles.vaultPinButtonText}>
                Obtain PIN
              </ThemedText>
            </Pressable>
          ) : null}

          {vaultPinPhase >= 1 ? (
            <View style={styles.phaseContainer}>
              <View style={styles.phaseHeader}>
                <View style={[styles.phaseIndicator, vaultPinPhase >= 2 && styles.phaseIndicatorComplete]}>
                  {vaultPinPhase >= 2 ? (
                    <Feather name="check" size={12} color={Colors.dark.success} />
                  ) : (
                    <ThemedText type="small" style={styles.phaseNumber}>1</ThemedText>
                  )}
                </View>
                <ThemedText type="small" style={styles.phaseTitle}>
                  Raw Biometric Data
                </ThemedText>
              </View>
              <View style={styles.dataDisplay}>
                <ThemedText type="small" style={styles.dataText}>
                  {rawBiometricData}
                </ThemedText>
              </View>
            </View>
          ) : null}

          {vaultPinPhase >= 2 ? (
            <View style={styles.phaseContainer}>
              <View style={styles.phaseArrow}>
                <Feather name="arrow-down" size={20} color="#8B5CF6" />
                <ThemedText type="small" style={styles.convertingText}>
                  Converting to secure template...
                </ThemedText>
              </View>
              <View style={styles.phaseHeader}>
                <View style={[styles.phaseIndicator, vaultPinPhase >= 3 && styles.phaseIndicatorComplete]}>
                  {vaultPinPhase >= 3 ? (
                    <Feather name="check" size={12} color={Colors.dark.success} />
                  ) : (
                    <ThemedText type="small" style={styles.phaseNumber}>2</ThemedText>
                  )}
                </View>
                <ThemedText type="small" style={styles.phaseTitle}>
                  Encrypted Hash Generated
                </ThemedText>
              </View>
              <View style={styles.hashDisplay}>
                <ThemedText type="small" style={styles.hashText}>
                  {encryptedHash}
                </ThemedText>
              </View>
            </View>
          ) : null}

          {vaultPinPhase >= 3 ? (
            <View style={styles.phaseContainer}>
              <View style={styles.phaseHeader}>
                <View style={[styles.phaseIndicator, styles.phaseIndicatorComplete]}>
                  <Feather name="check" size={12} color={Colors.dark.success} />
                </View>
                <ThemedText type="small" style={[styles.phaseTitle, { color: Colors.dark.success }]}>
                  Biometric template saved securely
                </ThemedText>
              </View>
              
              <View style={styles.loginCodeContainer}>
                <ThemedText type="small" style={styles.loginCodeLabel}>
                  Your Login Code (Last 3 digits):
                </ThemedText>
                <Pressable 
                  style={styles.loginCodeDisplay}
                  onPress={() => setCodeRevealed(!codeRevealed)}
                >
                  <ThemedText type="h1" style={styles.loginCodeText}>
                    {codeRevealed ? `***...${loginCode}` : "***...***"}
                  </ThemedText>
                  <Feather 
                    name={codeRevealed ? "eye-off" : "eye"} 
                    size={24} 
                    color="#8B5CF6" 
                  />
                </Pressable>
                <ThemedText type="small" style={styles.loginCodeHint}>
                  Next time, use your fingerprint + these 3 digits to log in
                </ThemedText>
                <ThemedText type="small" style={styles.tapToReveal}>
                  [Tap to reveal/hide]
                </ThemedText>
              </View>
            </View>
          ) : null}

          {vaultPinPhase >= 4 ? (
            <View style={styles.phaseContainer}>
              <View style={styles.phaseHeader}>
                <View style={[styles.phaseIndicator, styles.phaseIndicatorComplete]}>
                  <Feather name="check" size={12} color={Colors.dark.success} />
                </View>
                <ThemedText type="small" style={[styles.phaseTitle, { color: Colors.dark.success }]}>
                  Biometric setup complete
                </ThemedText>
              </View>

              {!testLoginSuccess ? (
                <Pressable 
                  style={[styles.testLoginButton, testLoginActive && styles.testLoginButtonActive]}
                  onPress={handleTestLogin}
                  disabled={testLoginActive}
                >
                  {testLoginActive ? (
                    <>
                      <Feather name="loader" size={20} color={Colors.dark.buttonText} />
                      <ThemedText type="body" style={styles.testLoginButtonText}>
                        Verifying...
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <Feather name="user-check" size={20} color={Colors.dark.buttonText} />
                      <ThemedText type="body" style={styles.testLoginButtonText}>
                        Test Login
                      </ThemedText>
                    </>
                  )}
                </Pressable>
              ) : (
                <View style={styles.testLoginSuccess}>
                  <Feather name="check-circle" size={24} color={Colors.dark.success} />
                  <ThemedText type="body" style={styles.testLoginSuccessText}>
                    Biometric template verified successfully
                  </ThemedText>
                </View>
              )}
              
              {!testLoginSuccess ? (
                <ThemedText type="small" style={styles.testLoginHint}>
                  User places finger again to verify the template works
                </ThemedText>
              ) : null}
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
  vaultPinCard: {
    borderColor: "#8B5CF6",
    backgroundColor: "rgba(139, 92, 246, 0.03)",
  },
  iconContainerVaultPinProcessing: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  vaultPinDescription: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  vaultPinDescriptionText: {
    flex: 1,
    color: Colors.dark.textTertiary,
    lineHeight: 18,
  },
  vaultPinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: "#8B5CF6",
    borderRadius: BorderRadius.sm,
  },
  vaultPinButtonText: {
    color: Colors.dark.buttonText,
    fontWeight: "600",
  },
  phaseContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  phaseIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  phaseIndicatorComplete: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: Colors.dark.success,
  },
  phaseNumber: {
    color: "#8B5CF6",
    fontWeight: "600",
    fontSize: 11,
  },
  phaseTitle: {
    color: Colors.dark.text,
    fontWeight: "500",
  },
  phaseArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  convertingText: {
    color: "#8B5CF6",
    fontStyle: "italic",
  },
  dataDisplay: {
    padding: Spacing.md,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  dataText: {
    color: "#A78BFA",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
  },
  hashDisplay: {
    padding: Spacing.md,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  hashText: {
    color: Colors.dark.success,
    fontFamily: "monospace",
    fontSize: 12,
  },
  loginCodeContainer: {
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  loginCodeLabel: {
    color: Colors.dark.textSecondary,
  },
  loginCodeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
  },
  loginCodeText: {
    color: "#8B5CF6",
    fontFamily: "monospace",
    letterSpacing: 4,
  },
  loginCodeHint: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  tapToReveal: {
    color: Colors.dark.textTertiary,
    fontSize: 11,
  },
  testLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.sm,
  },
  testLoginButtonActive: {
    backgroundColor: Colors.dark.textTertiary,
  },
  testLoginButtonText: {
    color: Colors.dark.buttonText,
    fontWeight: "600",
  },
  testLoginSuccess: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: BorderRadius.sm,
  },
  testLoginSuccessText: {
    color: Colors.dark.success,
    fontWeight: "500",
  },
  testLoginHint: {
    color: Colors.dark.textTertiary,
    textAlign: "center",
    fontSize: 11,
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
