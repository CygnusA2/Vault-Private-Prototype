import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { AuthKeyboardAwareScrollView } from "@/components/AuthKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

type PhoneEntryScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "PhoneEntry">;
};

const COUNTRY_CODES = [
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+41", country: "CH" },
  { code: "+971", country: "AE" },
  { code: "+65", country: "SG" },
  { code: "+852", country: "HK" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PhoneEntryScreen({ navigation }: PhoneEntryScreenProps) {
  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isValid = phoneNumber.length >= 8;

  const handleContinue = () => {
    if (isValid) {
      navigation.navigate("SMSVerification", {
        phoneNumber: `${selectedCode.code} ${phoneNumber}`,
      });
    }
  };

  return (
    <AuthKeyboardAwareScrollView
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Enter your phone number
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          We will send you a verification code to confirm your identity
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.inputContainer}>
        <Pressable
          style={[styles.countryPicker, showPicker && styles.countryPickerActive]}
          onPress={() => setShowPicker(!showPicker)}
        >
          <ThemedText type="h4" style={styles.countryCode}>
            {selectedCode.code}
          </ThemedText>
          <Feather
            name={showPicker ? "chevron-up" : "chevron-down"}
            size={20}
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
            autoFocus
          />
        </View>
      </Animated.View>

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
    </AuthKeyboardAwareScrollView>
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
    paddingHorizontal: Spacing.lg,
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
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
  spacer: {
    flex: 1,
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
