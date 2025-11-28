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
import { AuthScreenScrollView } from "@/components/AuthScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";
import ProgressStepper from "@/components/ProgressStepper";

type KYCDocumentScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "KYCDocument">;
};

type DocumentRequirement = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  uploaded: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KYCDocumentScreen({ navigation }: KYCDocumentScreenProps) {
  const { setUserData } = useAuth();
  const buttonScale = useSharedValue(1);

  const [documents, setDocuments] = useState<DocumentRequirement[]>([
    {
      id: "passport",
      label: "Passport",
      description: "Valid government-issued passport",
      icon: "book",
      uploaded: false,
    },
    {
      id: "id_card",
      label: "National ID Card",
      description: "Front and back of national ID",
      icon: "credit-card",
      uploaded: false,
    },
    {
      id: "proof_of_address",
      label: "Proof of Address",
      description: "Utility bill or bank statement - No older than 1 month",
      icon: "file-text",
      uploaded: false,
    },
  ]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const allUploaded = documents.every((doc) => doc.uploaded);
  const uploadedCount = documents.filter((doc) => doc.uploaded).length;

  const handleUpload = (docId: string) => {
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, uploaded: true } : doc
        )
      );
    }, 500);
  };

  const handleContinue = () => {
    setUserData({ documentsUploaded: true });
    navigation.navigate("KYCSelfie");
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <ProgressStepper currentStep={2} totalSteps={5} />

      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Identity Documents
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
        >
          Please upload all required documents for verification
        </ThemedText>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(uploadedCount / documents.length) * 100}%` }
              ]} 
            />
          </View>
          <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
            {uploadedCount} of {documents.length} documents uploaded
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.documentsList}>
        {documents.map((doc, index) => (
          <Animated.View
            key={doc.id}
            entering={FadeIn.duration(400).delay(index * 100)}
          >
            <Pressable
              style={[
                styles.documentItem,
                doc.uploaded && styles.documentItemUploaded,
              ]}
              onPress={() => !doc.uploaded && handleUpload(doc.id)}
            >
              <View style={[
                styles.iconContainer,
                doc.uploaded && styles.iconContainerUploaded,
              ]}>
                <Feather
                  name={doc.uploaded ? "check" : doc.icon}
                  size={24}
                  color={doc.uploaded ? Colors.dark.success : Colors.dark.primary}
                />
              </View>
              
              <View style={styles.documentInfo}>
                <ThemedText
                  type="h4"
                  style={[
                    styles.documentLabel,
                    doc.uploaded && styles.documentLabelUploaded,
                  ]}
                >
                  {doc.label}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: Colors.dark.textSecondary }}
                >
                  {doc.description}
                </ThemedText>
              </View>

              {doc.uploaded ? (
                <View style={styles.uploadedBadge}>
                  <Feather name="check-circle" size={20} color={Colors.dark.success} />
                </View>
              ) : (
                <View style={styles.uploadButton}>
                  <Feather name="upload" size={18} color={Colors.dark.primary} />
                  <ThemedText type="small" style={{ color: Colors.dark.primary }}>
                    Upload
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>

      <View style={styles.infoBox}>
        <Feather name="shield" size={18} color={Colors.dark.primary} />
        <ThemedText type="small" style={{ color: Colors.dark.textSecondary, flex: 1 }}>
          Your documents are encrypted and securely stored in compliance with international banking regulations.
        </ThemedText>
      </View>

      <View style={styles.spacer} />

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
        <AnimatedPressable
          onPress={allUploaded ? handleContinue : undefined}
          disabled={!allUploaded}
          onPressIn={() => {
            if (allUploaded) {
              buttonScale.value = withSpring(0.97);
            }
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1);
          }}
          style={[
            styles.continueButton, 
            !allUploaded && styles.continueButtonDisabled,
            buttonAnimatedStyle
          ]}
        >
          <ThemedText
            type="h4"
            style={[styles.buttonText, { color: Colors.dark.buttonText }]}
          >
            {allUploaded ? "Continue" : `Upload All Documents (${uploadedCount}/${documents.length})`}
          </ThemedText>
        </AnimatedPressable>

        {!allUploaded ? (
          <Pressable 
            style={styles.skipLink}
            onPress={handleContinue}
          >
            <ThemedText type="small" style={{ color: Colors.dark.textTertiary }}>
              Skip for demo
            </ThemedText>
          </Pressable>
        ) : null}
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
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  documentsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.md,
  },
  documentItemUploaded: {
    borderColor: Colors.dark.success,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerUploaded: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  documentInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  documentLabel: {
    color: Colors.dark.text,
  },
  documentLabelUploaded: {
    color: Colors.dark.success,
  },
  uploadedBadge: {
    padding: Spacing.sm,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xl,
  },
  continueButton: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: "600",
  },
  skipLink: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
});
