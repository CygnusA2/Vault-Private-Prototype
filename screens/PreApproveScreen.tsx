import React, { useState, useEffect } from "react";
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
import { AuthScreenScrollView } from "@/components/AuthScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const REQUIRED_DOCS = [
  { id: "id", label: "Government-issued ID", critical: true, points: 15, preVerified: true },
  { id: "address", label: "Proof of Address", critical: true, points: 10, preVerified: true },
  { id: "ownership", label: "Proof of Ownership", critical: true, points: 20, preVerified: false },
  { id: "asset", label: "Asset Documentation", critical: true, points: 15, preVerified: false },
];

export default function PreApproveScreen() {
  const { setNeedsPreApprove, setNeedsIlliquidAssets } = useAuth();
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(["id", "address"]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const baseApproval = 40;
  const uploadedPoints = REQUIRED_DOCS.filter((doc) =>
    uploadedDocs.includes(doc.id)
  ).reduce((sum, doc) => sum + doc.points, 0);
  const approvalLikelihood = Math.min(baseApproval + uploadedPoints, 100);
  
  const preVerifiedCount = REQUIRED_DOCS.filter(doc => doc.preVerified).length;
  const remainingDocs = REQUIRED_DOCS.filter(doc => !doc.preVerified);
  const allRemainingUploaded = remainingDocs.every(doc => uploadedDocs.includes(doc.id));
  const completeness = (uploadedDocs.length / REQUIRED_DOCS.length) * 100;

  useEffect(() => {
    if (allRemainingUploaded) {
      const timer = setTimeout(() => {
        setNeedsPreApprove(false);
        setNeedsIlliquidAssets(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allRemainingUploaded]);

  const getApprovalLabel = (likelihood: number) => {
    if (likelihood >= 80) return "High";
    if (likelihood >= 60) return "Medium-High";
    return "Medium";
  };

  const toggleDoc = (docId: string) => {
    const doc = REQUIRED_DOCS.find(d => d.id === docId);
    if (doc?.preVerified) return;
    
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

  const handleContinue = () => {
    setNeedsPreApprove(false);
    setNeedsIlliquidAssets(true);
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View
        entering={FadeInDown.duration(500).delay(100)}
        style={styles.headerSection}
      >
        <ThemedText style={styles.mainTitle}>Pre-Approval in progress</ThemedText>
        <ThemedText style={styles.subtitle}>
          Upload remaining documents to unlock 15-minute funding.
        </ThemedText>
        <View style={styles.timeEstimate}>
          <Feather name="clock" size={12} color={Colors.dark.sage} />
          <ThemedText style={styles.timeText}>
            Estimated time to pre-approval: 1-2 minutes
          </ThemedText>
        </View>

        <View style={styles.verifiedBadge}>
          <Feather name="check-circle" size={14} color={Colors.dark.successBright} />
          <ThemedText style={styles.verifiedText}>
            {preVerifiedCount} documents already verified from KYC
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
            {"\u2022"} Only upload Proof of Ownership and Asset Documentation
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
              isPreVerified={doc.preVerified}
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
          <ThemedText style={[styles.approvalPercent, approvalLikelihood >= 65 && styles.approvalPercentHigh]}>
            {approvalLikelihood}%
          </ThemedText>
          <ThemedText style={styles.approvalLevel}>
            {getApprovalLabel(approvalLikelihood)}
          </ThemedText>
          {!allRemainingUploaded ? (
            <ThemedText style={styles.approvalHint}>
              Upload remaining documents to proceed automatically
            </ThemedText>
          ) : (
            <View style={styles.autoProgressBadge}>
              <Feather name="loader" size={14} color={Colors.dark.successBright} />
              <ThemedText style={styles.autoProgressText}>
                All documents verified - Proceeding...
              </ThemedText>
            </View>
          )}
        </View>

        {!allRemainingUploaded ? (
          <ContinueButton onPress={handleContinue} disabled={!allRemainingUploaded} />
        ) : null}
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
                {remainingDocs.filter((doc) => !uploadedDocs.includes(doc.id)).map(
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
                {allRemainingUploaded ? (
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
    </AuthScreenScrollView>
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

function ContinueButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.continueButtonContainer, animatedStyle, disabled && styles.continueButtonDisabled]}
    >
      <LinearGradient
        colors={disabled ? ["#666", "#555", "#444"] : [Colors.dark.primary, "#D4B872", "#E5C88A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.continueButton}
      >
        <ThemedText style={[styles.continueButtonText, disabled && styles.continueButtonTextDisabled]}>
          Continue
        </ThemedText>
        <Feather name="arrow-right" size={18} color={disabled ? "#999" : "#1a1a1a"} />
      </LinearGradient>
    </AnimatedPressable>
  );
}

function DocumentItem({
  doc,
  isUploaded,
  isPreVerified,
  onToggle,
}: {
  doc: { id: string; label: string; critical: boolean; points: number };
  isUploaded: boolean;
  isPreVerified?: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (!isPreVerified) scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={isPreVerified ? undefined : onToggle}
      disabled={isPreVerified}
      style={[styles.docItem, animatedStyle, isPreVerified && styles.docItemPreVerified]}
    >
      <View
        style={[
          styles.checkbox,
          isUploaded && styles.checkboxChecked,
          isPreVerified && styles.checkboxPreVerified,
        ]}
      >
        {isUploaded ? (
          <Feather name="check" size={12} color={isPreVerified ? Colors.dark.successBright : "#1a1a1a"} />
        ) : null}
      </View>
      <View style={styles.docInfo}>
        <ThemedText style={[styles.docLabel, isPreVerified && styles.docLabelPreVerified]}>
          {doc.label}
        </ThemedText>
        {isPreVerified ? (
          <ThemedText style={styles.docMetaVerified}>
            Verified from KYC
          </ThemedText>
        ) : doc.critical ? (
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
    marginBottom: Spacing.md,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.dark.successBright,
    letterSpacing: 0.3,
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
  continueButtonContainer: {
    width: "100%",
    marginTop: Spacing.md,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  continueButtonTextDisabled: {
    color: "#999",
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
  docItemPreVerified: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderColor: "rgba(16, 185, 129, 0.2)",
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
  checkboxPreVerified: {
    backgroundColor: "transparent",
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
  docLabelPreVerified: {
    color: Colors.dark.successBright,
  },
  docMeta: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  docMetaVerified: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.successBright,
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
    color: Colors.dark.primary,
    letterSpacing: 0.5,
  },
  approvalPercentHigh: {
    color: Colors.dark.successBright,
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
  autoProgressBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  autoProgressText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.dark.successBright,
    letterSpacing: 0.3,
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
