import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";
import ProgressStepper from "@/components/ProgressStepper";

type KYCNameScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "KYCName">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KYCNameScreen({ navigation }: KYCNameScreenProps) {
  const { setUserData } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isValid = firstName.length >= 2 && lastName.length >= 2 && email.includes("@");

  const handleContinue = () => {
    if (isValid) {
      setUserData({ firstName, lastName, email });
      navigation.navigate("KYCDocument");
    }
  };

  return (
    <ScreenKeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
      <ProgressStepper currentStep={1} totalSteps={5} />

      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Personal Details
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          Please provide your legal name as it appears on your ID
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            FIRST NAME
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              placeholderTextColor={Colors.dark.textTertiary}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            LAST NAME
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              placeholderTextColor={Colors.dark.textTertiary}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            EMAIL ADDRESS
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor={Colors.dark.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </Animated.View>

      <View style={styles.spacer} />

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
        <AnimatedPressable
          onPress={handleContinue}
          disabled={!isValid}
          onPressIn={() => {
            buttonScale.value = withSpring(0.97);
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1);
          }}
          style={[
            styles.continueButton,
            !isValid && styles.continueButtonDisabled,
            buttonAnimatedStyle,
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
    </ScreenKeyboardAwareScrollView>
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
  form: {
    gap: Spacing.xl,
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
