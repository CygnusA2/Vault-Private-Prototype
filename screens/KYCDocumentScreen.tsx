import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";
import ProgressStepper from "@/components/ProgressStepper";

type KYCDocumentScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "KYCDocument">;
};

const DOCUMENT_TYPES = [
  { id: "passport", label: "Passport", icon: "book" as const },
  { id: "id_card", label: "National ID Card", icon: "credit-card" as const },
  { id: "drivers", label: "Driver License", icon: "truck" as const },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KYCDocumentScreen({ navigation }: KYCDocumentScreenProps) {
  const { setUserData } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isValid = selectedType && isUploaded;

  const handleUpload = () => {
    setTimeout(() => {
      setIsUploaded(true);
    }, 500);
  };

  const handleContinue = () => {
    if (isValid) {
      setUserData({ documentType: selectedType, documentUploaded: true });
      navigation.navigate("KYCSelfie");
    }
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <ProgressStepper currentStep={2} totalSteps={5} />

      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Identity Document
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          Select and upload a valid government-issued ID for verification
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.documentTypes}>
        {DOCUMENT_TYPES.map((type) => (
          <Pressable
            key={type.id}
            style={[
              styles.documentOption,
              selectedType === type.id && styles.documentOptionSelected,
            ]}
            onPress={() => {
              setSelectedType(type.id);
              setIsUploaded(false);
            }}
          >
            <Feather
              name={type.icon}
              size={24}
              color={
                selectedType === type.id
                  ? Colors.dark.primary
                  : Colors.dark.textSecondary
              }
            />
            <ThemedText
              type="body"
              style={[
                styles.documentLabel,
                selectedType === type.id && styles.documentLabelSelected,
              ]}
            >
              {type.label}
            </ThemedText>
            {selectedType === type.id ? (
              <Feather name="check-circle" size={20} color={Colors.dark.primary} />
            ) : null}
          </Pressable>
        ))}
      </Animated.View>

      {selectedType ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.uploadSection}>
          <Pressable
            style={[
              styles.uploadBox,
              isUploaded && styles.uploadBoxSuccess,
            ]}
            onPress={handleUpload}
          >
            {isUploaded ? (
              <>
                <View style={styles.successIcon}>
                  <Feather name="check" size={32} color={Colors.dark.success} />
                </View>
                <ThemedText type="h4" style={styles.uploadTitle}>
                  Document Uploaded
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: Colors.dark.textSecondary }}
                >
                  Tap to change document
                </ThemedText>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Feather name="upload" size={32} color={Colors.dark.primary} />
                </View>
                <ThemedText type="h4" style={styles.uploadTitle}>
                  Upload Document
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: Colors.dark.textSecondary }}
                >
                  Take a photo or select from gallery
                </ThemedText>
              </>
            )}
          </Pressable>
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
    </ScreenScrollView>
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
  documentTypes: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  documentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.lg,
  },
  documentOptionSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  documentLabel: {
    flex: 1,
    color: Colors.dark.text,
  },
  documentLabelSelected: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  uploadSection: {
    marginBottom: Spacing["2xl"],
  },
  uploadBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: "dashed",
  },
  uploadBoxSuccess: {
    borderColor: Colors.dark.success,
    borderStyle: "solid",
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  uploadTitle: {
    marginBottom: Spacing.sm,
    color: Colors.dark.text,
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
