import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { AuthKeyboardAwareScrollView } from "@/components/AuthKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";
import ProgressStepper from "@/components/ProgressStepper";

type KYCAddressScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "KYCAddress">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KYCAddressScreen({ navigation }: KYCAddressScreenProps) {
  const { setUserData, completeOnboarding } = useAuth();
  const [isDetecting, setIsDetecting] = useState(true);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStreet("2800 Sand Hill Road");
      setCity("Menlo Park");
      setCountry("California, United States");
      setPostalCode("94025");
      setIsDetecting(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isValid =
    street.length > 0 && city.length > 0 && country.length > 0 && postalCode.length > 0;

  const handleComplete = () => {
    setUserData({
      address: { 
        street: street || "2800 Sand Hill Road", 
        city: city || "Menlo Park", 
        country: country || "California, United States", 
        postalCode: postalCode || "94025" 
      },
    });
    completeOnboarding();
  };

  return (
    <AuthKeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
      <ProgressStepper currentStep={5} totalSteps={5} />

      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Address Details
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          Confirm your residential address for account verification
        </ThemedText>
      </Animated.View>

      {isDetecting ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.detectingContainer}>
          <View style={styles.detectingIcon}>
            <Feather name="navigation" size={24} color={Colors.dark.primary} />
          </View>
          <ThemedText type="body" style={{ color: Colors.dark.primary }}>
            Detecting your location...
          </ThemedText>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={styles.detectedContainer}>
          <Feather name="check-circle" size={20} color={Colors.dark.success} />
          <ThemedText type="small" style={{ color: Colors.dark.success }}>
            Location detected - verify details below
          </ThemedText>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            STREET ADDRESS
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter street address"
              placeholderTextColor={Colors.dark.textTertiary}
              value={street}
              onChangeText={setStreet}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <ThemedText type="label" style={styles.label}>
              CITY
            </ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={Colors.dark.textTertiary}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { width: 120 }]}>
            <ThemedText type="label" style={styles.label}>
              POSTAL CODE
            </ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Code"
                placeholderTextColor={Colors.dark.textTertiary}
                value={postalCode}
                onChangeText={setPostalCode}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            COUNTRY
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter country"
              placeholderTextColor={Colors.dark.textTertiary}
              value={country}
              onChangeText={setCountry}
            />
          </View>
        </View>
      </Animated.View>

      <View style={styles.spacer} />

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
        <AnimatedPressable
          onPress={handleComplete}
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
            Complete Setup
          </ThemedText>
        </AnimatedPressable>
      </Animated.View>
    </AuthKeyboardAwareScrollView>
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
  detectingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing["2xl"],
  },
  detectingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  detectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing["2xl"],
  },
  form: {
    gap: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  flex1: {
    flex: 1,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    height: Spacing.inputHeight,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  input: {
    color: Colors.dark.text,
    fontSize: 17,
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
