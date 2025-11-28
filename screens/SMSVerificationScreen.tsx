import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";

type SMSVerificationScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SMSVerification">;
  route: RouteProp<AuthStackParamList, "SMSVerification">;
};

const CODE_LENGTH = 6;

export default function SMSVerificationScreen({
  navigation,
  route,
}: SMSVerificationScreenProps) {
  const { phoneNumber } = route.params;
  const { setUserData } = useAuth();
  const [code, setCode] = useState<string[]>(new Array(CODE_LENGTH).fill(""));
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== "") && newCode.join("").length === CODE_LENGTH) {
      verifyCode(newCode.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = (fullCode: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      if (fullCode === "123456") {
        setUserData({ phoneNumber });
        navigation.navigate("KYCName");
      } else {
        shakeAnim.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        setCode(new Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        setIsVerifying(false);
      }
    }, 1000);
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Enter verification code
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          We sent a 6-digit code to
        </ThemedText>
        <ThemedText type="h4" style={[styles.phone, { color: Colors.dark.primary }]}>
          {phoneNumber}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.codeHint}>
        <ThemedText type="small" style={{ color: Colors.dark.textTertiary }}>
          Demo: Enter 123456 to continue
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        style={[styles.codeContainer, shakeStyle]}
      >
        {code.map((digit, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.duration(300).delay(index * 50)}
            style={[
              styles.codeBox,
              digit !== "" && styles.codeBoxFilled,
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.codeInput}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              editable={!isVerifying}
              autoFocus={index === 0}
            />
          </Animated.View>
        ))}
      </Animated.View>

      {isVerifying ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.verifyingContainer}>
          <ThemedText type="body" style={{ color: Colors.dark.textSecondary }}>
            Verifying...
          </ThemedText>
        </Animated.View>
      ) : null}

      <View style={styles.spacer} />

      <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.resendContainer}>
        <ThemedText type="body" style={{ color: Colors.dark.textSecondary }}>
          Did not receive code?
        </ThemedText>
        <Pressable onPress={handleResend} disabled={resendTimer > 0}>
          <ThemedText
            type="body"
            style={[
              styles.resendText,
              resendTimer > 0 && styles.resendTextDisabled,
            ]}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    marginBottom: Spacing.xs,
  },
  phone: {
    marginTop: Spacing.xs,
  },
  codeHint: {
    marginBottom: Spacing["2xl"],
    padding: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing["3xl"],
  },
  codeBox: {
    width: 48,
    height: 56,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
  },
  codeBoxFilled: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  codeInput: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  verifyingContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  spacer: {
    flex: 1,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  resendText: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: Colors.dark.textTertiary,
    fontWeight: "400",
  },
});
