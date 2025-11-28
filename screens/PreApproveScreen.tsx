import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const REQUIRED_DOCS = [
  { id: "id", label: "Government-issued ID", critical: true, points: 15 },
  { id: "ownership", label: "Proof of Ownership", critical: true, points: 20 },
  { id: "address", label: "Proof of Address", critical: true, points: 10 },
  { id: "asset", label: "Asset Documentation", critical: true, points: 15 },
];

export default function PreApproveScreen() {
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const baseApproval = 40;
  const uploadedPoints = REQUIRED_DOCS.filter((doc) =>
    uploadedDocs.includes(doc.id)
  ).reduce((sum, doc) => sum + doc.points, 0);
  const approvalLikelihood = Math.min(baseApproval + uploadedPoints, 100);
  const completeness = (uploadedDocs.length / REQUIRED_DOCS.length) * 100;

  const getApprovalLabel = (likelihood: number) => {
    if (likelihood >= 80) return "High";
    if (likelihood >= 60) return "Medium";
    return "Low";
  };

  const toggleDoc = (docId: string) => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setUploadedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleUploadPress = async () => {
    const isWeb = Platform.OS !== "ios" && Platform.OS !== "android";
    
    if (isWeb) {
      setShowUploadModal(true);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowUploadModal(true);
      }
    } catch (error) {
      setShowUploadModal(true);
    }
  };

  const simulateUpload = (docId: string) => {
    setIsUploading(true);
    setTimeout(() => {
      if (!uploadedDocs.includes(docId)) {
        toggleDoc(docId);
      }
      setIsUploading(false);
      setShowUploadModal(false);
    }, 1500);
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View
        entering={FadeInDown.duration(500).delay(100)}
        style={styles.headerSection}
      >
        <ThemedText style={styles.mainTitle}>Pre-Approval in progress</ThemedText>
        <ThemedText style={styles.subtitle}>
          Upload your documents to unlock 15-minute funding.
        </ThemedText>
        <View style={styles.timeEstimate}>
          <Feather name="clock" size={12} color={Colors.dark.sage} />
          <ThemedText style={styles.timeText}>
            Estimated time to pre-approval: 2-3 minutes
          </ThemedText>
        </View>

        <View style={styles.requirements}>
          <ThemedText style={styles.requirementItem}>
            {"\u2022"} All documents must be fully digitised
          </ThemedText>
          <ThemedText style={styles.requirementItem}>
            {"\u2022"} Illiquid asset documents must be issued within last 3 months
          </ThemedText>
          <ThemedText style={styles.requirementItem}>
            {"\u2022"} Passport/DNI must be valid and not expired
          </ThemedText>
          <ThemedText style={styles.requirementItem}>
            {"\u2022"} Proof of address must be issued within last 1 month
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        style={styles.uploadCard}
      >
        <Feather
          name="upload"
          size={48}
          color={Colors.dark.cream}
          style={{ opacity: 0.6 }}
        />
        <UploadButton onPress={handleUploadPress} />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <ThemedText style={styles.sectionLabel}>REQUIRED DOCUMENTS</ThemedText>
        <View style={styles.docsList}>
          {REQUIRED_DOCS.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              isUploaded={uploadedDocs.includes(doc.id)}
              onToggle={() => toggleDoc(doc.id)}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(400)}
        style={styles.bottomSection}
      >
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressLabel}>PROFILE COMPLETENESS</ThemedText>
            <ThemedText style={styles.progressValue}>
              {Math.round(completeness)}%
            </ThemedText>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={["#D4AF37", "#F4E5C3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${completeness}%` }]}
            />
          </View>
        </View>

        <View style={styles.approvalCard}>
          <ThemedText style={styles.approvalLabel}>APPROVAL LIKELIHOOD</ThemedText>
          <ThemedText style={styles.approvalPercent}>{approvalLikelihood}%</ThemedText>
          <ThemedText style={styles.approvalLevel}>
            {getApprovalLabel(approvalLikelihood)}
          </ThemedText>
          {uploadedDocs.length < REQUIRED_DOCS.length ? (
            <ThemedText style={styles.approvalHint}>
              Upload all required documents to maximize approval chances
            </ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {isUploading ? "Uploading..." : "Select Document Type"}
            </ThemedText>
            {isUploading ? (
              <View style={styles.uploadingContainer}>
                <Feather name="loader" size={32} color={Colors.dark.successBright} />
                <ThemedText style={styles.uploadingText}>
                  Processing document...
                </ThemedText>
              </View>
            ) : (
              <>
                <ThemedText style={styles.modalSubtitle}>
                  Demo: Select which document to mark as uploaded
                </ThemedText>
                {REQUIRED_DOCS.filter((doc) => !uploadedDocs.includes(doc.id)).map(
                  (doc) => (
                    <Pressable
                      key={doc.id}
                      style={styles.modalOption}
                      onPress={() => simulateUpload(doc.id)}
                    >
                      <Feather name="file-text" size={20} color={Colors.dark.cream} />
                      <ThemedText style={styles.modalOptionText}>{doc.label}</ThemedText>
                    </Pressable>
                  )
                )}
                {uploadedDocs.length === REQUIRED_DOCS.length ? (
                  <ThemedText style={styles.allUploadedText}>
                    All documents have been uploaded!
                  </ThemedText>
                ) : null}
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setShowUploadModal(false)}
                >
                  <ThemedText style={styles.modalCloseText}>Cancel</ThemedText>
                </Pressable>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

function UploadButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[styles.uploadButtonContainer, animatedStyle]}
    >
      <LinearGradient
        colors={["#2D5A45", "#3D7A5A", "#4A9968"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.uploadButton}
      >
        <ThemedText style={styles.uploadButtonText}>Upload document</ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function DocumentItem({
  doc,
  isUploaded,
  onToggle,
}: {
  doc: { id: string; label: string; critical: boolean; points: number };
  isUploaded: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onToggle}
      style={[styles.docItem, animatedStyle]}
    >
      <View
        style={[
          styles.checkbox,
          isUploaded && styles.checkboxChecked,
        ]}
      >
        {isUploaded ? (
          <Feather name="check" size={12} color="#1a1a1a" />
        ) : null}
      </View>
      <View style={styles.docInfo}>
        <ThemedText style={styles.docLabel}>{doc.label}</ThemedText>
        {doc.critical ? (
          <ThemedText style={styles.docMeta}>
            Required {"\u2022"} +{doc.points}% approval
          </ThemedText>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  headerSection: {
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "300",
    color: Colors.dark.cream,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  timeEstimate: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.5,
  },
  requirements: {
    alignSelf: "stretch",
    gap: Spacing.xs,
  },
  requirementItem: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.3,
  },
  uploadCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorderGlass,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.lg,
  },
  uploadButtonContainer: {
    width: "100%",
  },
  uploadButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#E5E4E2",
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  docsList: {
    gap: Spacing.md,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorderGlass,
    padding: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.sage,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.successBright,
    borderColor: Colors.dark.successBright,
  },
  docInfo: {
    flex: 1,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.dark.cream,
    letterSpacing: 0.3,
  },
  docMeta: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  bottomSection: {
    gap: Spacing.lg,
  },
  progressSection: {
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 2,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.cream,
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  approvalCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorderGlass,
    padding: Spacing.lg,
    alignItems: "center",
  },
  approvalLabel: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  approvalPercent: {
    fontSize: 32,
    fontWeight: "300",
    color: Colors.dark.successBright,
    letterSpacing: 0.5,
  },
  approvalLevel: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.dark.cream,
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  approvalHint: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.3,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorderGlass,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.dark.cream,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.sage,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.dark.cream,
  },
  modalCloseButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.dark.sage,
  },
  uploadingContainer: {
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  allUploadedText: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.dark.successBright,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
});
