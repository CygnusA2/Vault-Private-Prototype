import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Image, Pressable, TextInput, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";

const TYPEWRITER_TEXT = `Vault Private isn't just about speed—it's about control. Real wealth isn't just accessible; it's protected. Your assets. Your terms. Your timeline. Only you decide when capital moves.`;

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

const COUNTRY_CODES = [
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+41", country: "CH" },
  { code: "+971", country: "AE" },
  { code: "+65", country: "SG" },
  { code: "+852", country: "HK" },
];

const CODE_LENGTH = 6;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { setUserData } = useAuth();
  
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [code, setCode] = useState<string[]>(new Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const buttonScale = useSharedValue(1);
  const shakeAnim = useSharedValue(0);
  
  const [typewriterText, setTypewriterText] = useState("");
  const charIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const typeNextChar = () => {
      if (charIndexRef.current < TYPEWRITER_TEXT.length) {
        const nextChar = TYPEWRITER_TEXT[charIndexRef.current];
        setTypewriterText(TYPEWRITER_TEXT.substring(0, charIndexRef.current + 1));
        charIndexRef.current++;

        let delay = 95 + Math.random() * 60;
        
        if (nextChar === "." || nextChar === ",") {
          delay = 650 + Math.random() * 450;
        } else if (nextChar === "—") {
          delay = 400 + Math.random() * 200;
        } else if (Math.random() < 0.10) {
          delay = 400 + Math.random() * 300;
        }

        timeoutRef.current = setTimeout(typeNextChar, delay);
      }
    };

    timeoutRef.current = setTimeout(typeNextChar, 2000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const isPhoneValid = phoneNumber.length >= 8;

  const handleSendCode = () => {
    if (isPhoneValid) {
      setIsSending(true);
      setTimeout(() => {
        setIsSending(false);
        setStep("verify");
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
      }, 1500);
    }
  };

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
        setUserData({ phoneNumber: `${selectedCode.code} ${phoneNumber}` });
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0E14", "#1A1F2E", "#0A0E14"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["2xl"],
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
      >
        <Animated.View
          entering={FadeIn.duration(800).delay(200)}
          style={styles.logoContainer}
        >
          <View style={styles.logoGlow}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText type="display" style={styles.title}>
            Vault Private
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
          >
            Exclusive banking for distinguished clients
          </ThemedText>
          <View style={styles.poweredByContainer}>
            <ThemedText
              type="small"
              style={styles.poweredByText}
            >
              Powered by
            </ThemedText>
            <ThemedText style={styles.cygnusText}>
              Cygnus-A²
            </ThemedText>
          </View>
        </Animated.View>

        {step === "phone" ? (
          <Animated.View
            entering={FadeInDown.duration(600).delay(400)}
            style={styles.formContainer}
          >
            <ThemedText type="h3" style={styles.formTitle}>
              Enter your phone number
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.formSubtitle, { color: Colors.dark.textSecondary }]}
            >
              We will send you a verification code
            </ThemedText>

            <View style={styles.inputContainer}>
              <Pressable
                style={[styles.countryPicker, showPicker && styles.countryPickerActive]}
                onPress={() => setShowPicker(!showPicker)}
              >
                <ThemedText type="h4" style={styles.countryCode}>
                  {selectedCode.code}
                </ThemedText>
                <Feather
                  name={showPicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.dark.textSecondary}
                />
              </Pressable>

              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  placeholderTextColor={Colors.dark.textTertiary}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {showPicker ? (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.pickerDropdown}>
                {COUNTRY_CODES.map((item) => (
                  <Pressable
                    key={item.code}
                    style={[
                      styles.pickerItem,
                      selectedCode.code === item.code && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCode(item);
                      setShowPicker(false);
                    }}
                  >
                    <ThemedText type="body" style={styles.pickerItemText}>
                      {item.country}
                    </ThemedText>
                    <ThemedText type="h4" style={styles.pickerItemCode}>
                      {item.code}
                    </ThemedText>
                  </Pressable>
                ))}
              </Animated.View>
            ) : null}

            <AnimatedPressable
              onPress={handleSendCode}
              disabled={!isPhoneValid || isSending}
              onPressIn={() => {
                buttonScale.value = withSpring(0.97);
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1);
              }}
              style={[
                styles.primaryButton,
                (!isPhoneValid || isSending) && styles.primaryButtonDisabled,
                buttonAnimatedStyle,
              ]}
            >
              <ThemedText
                type="h4"
                style={[styles.buttonText, { color: Colors.dark.buttonText }]}
              >
                {isSending ? "Sending Code..." : "Get Verification Code"}
              </ThemedText>
            </AnimatedPressable>

            <View style={styles.demoHint}>
              <ThemedText type="small" style={{ color: Colors.dark.textTertiary }}>
                Demo: Use code 123456 when prompted
              </ThemedText>
            </View>

            <View style={styles.typewriterContainer}>
              <ThemedText style={styles.typewriterText}>
                {typewriterText}
              </ThemedText>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={styles.formContainer}
          >
            <ThemedText type="h3" style={styles.formTitle}>
              Enter verification code
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.formSubtitle, { color: Colors.dark.textSecondary }]}
            >
              Sent to {selectedCode.code} {phoneNumber}
            </ThemedText>

            <Animated.View style={[styles.codeContainer, shakeStyle]}>
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
                  />
                </Animated.View>
              ))}
            </Animated.View>

            {isVerifying ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.verifyingContainer}>
                <ThemedText type="body" style={{ color: Colors.dark.primary }}>
                  Verifying...
                </ThemedText>
              </Animated.View>
            ) : null}

            <Pressable
              style={styles.changeNumberButton}
              onPress={() => {
                setStep("phone");
                setCode(new Array(CODE_LENGTH).fill(""));
              }}
            >
              <Feather name="edit-2" size={16} color={Colors.dark.textSecondary} />
              <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
                Change phone number
              </ThemedText>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logoGlow: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    color: Colors.dark.text,
    fontSize: 28,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
  },
  poweredByContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
    gap: 4,
  },
  poweredByText: {
    color: Colors.dark.textTertiary,
    fontSize: 12,
  },
  cygnusText: {
    color: Colors.dark.textTertiary,
    fontSize: 12,
  },
  formContainer: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    color: Colors.dark.text,
  },
  formSubtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  inputContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.xs,
  },
  countryPickerActive: {
    borderColor: Colors.dark.primary,
  },
  countryCode: {
    color: Colors.dark.text,
  },
  phoneInputContainer: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    height: Spacing.inputHeight,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  phoneInput: {
    color: Colors.dark.text,
    fontSize: 17,
    fontWeight: "500",
  },
  pickerDropdown: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  pickerItemSelected: {
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  pickerItemText: {
    color: Colors.dark.text,
  },
  pickerItemCode: {
    color: Colors.dark.primary,
  },
  primaryButton: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
  },
  demoHint: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
  },
  typewriterContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.sm,
    minHeight: 120,
  },
  typewriterText: {
    fontSize: 15,
    lineHeight: 26,
    color: Colors.dark.primary,
    fontWeight: "400",
    letterSpacing: 0.3,
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "Baskerville",
      android: "serif",
      default: "Georgia, Times New Roman, serif",
    }),
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  codeBox: {
    width: 46,
    height: 54,
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
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  verifyingContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  changeNumberButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
});
