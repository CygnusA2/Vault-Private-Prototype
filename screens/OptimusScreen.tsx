import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { AuthScreenScrollView } from "@/components/AuthScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OptimusScreen() {
  const { completeOptimus } = useAuth();
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionComplete, setConversionComplete] = useState(false);
  const rotateAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);

  const ledgerTokens = "8,920";
  const cashAmount = "$8,920,000";
  const availableCredit = "$8,920,000";

  useEffect(() => {
    if (isConverting) {
      rotateAnim.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.5, { duration: 500 })
        ),
        -1,
        false
      );
    }
  }, [isConverting]);

  useEffect(() => {
    if (conversionComplete) {
      const timer = setTimeout(() => {
        completeOptimus();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [conversionComplete]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  const handleStartConversion = () => {
    if (isConverting || conversionComplete) return;
    
    setIsConverting(true);
    setConversionProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 3;
      setConversionProgress(Math.min(progress, 100));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsConverting(false);
          setConversionComplete(true);
        }, 500);
      }
    }, 50);
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
        <View style={styles.optimusBadge}>
          {isConverting ? (
            <Animated.View style={rotateStyle}>
              <Feather name="loader" size={36} color={Colors.dark.successBright} />
            </Animated.View>
          ) : conversionComplete ? (
            <Feather name="check-circle" size={36} color={Colors.dark.successBright} />
          ) : (
            <Feather name="dollar-sign" size={36} color={Colors.dark.successBright} />
          )}
        </View>
        <ThemedText style={styles.title}>Optimus</ThemedText>
        <ThemedText style={styles.subtitle}>
          {conversionComplete 
            ? "Your funds are now available for immediate access"
            : "Convert your LedgerTokens to instant cash liquidity"
          }
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.conversionCard}>
        <View style={styles.conversionHeader}>
          <ThemedText style={styles.conversionLabel}>INSTANT LIQUIDITY CONVERSION</ThemedText>
        </View>
        
        <View style={styles.conversionContent}>
          <View style={styles.conversionSide}>
            <Feather name="hexagon" size={24} color={Colors.dark.primary} />
            <ThemedText style={styles.conversionAmount}>{ledgerTokens} LT</ThemedText>
            <ThemedText style={styles.conversionType}>LedgerTokens</ThemedText>
          </View>
          
          <View style={styles.conversionArrow}>
            <Feather name="arrow-right" size={20} color={Colors.dark.successBright} />
          </View>
          
          <View style={styles.conversionSide}>
            <Feather name="dollar-sign" size={24} color={Colors.dark.successBright} />
            <ThemedText style={[styles.conversionAmount, styles.cashAmount]}>{cashAmount}</ThemedText>
            <ThemedText style={styles.conversionType}>Available Cash</ThemedText>
          </View>
        </View>
      </Animated.View>

      {isConverting ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.progressCard}>
          <ThemedText style={styles.progressTitle}>Converting to Cash</ThemedText>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={["#10B981", "#34D399", "#6EE7B7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${conversionProgress}%` }]}
            />
          </View>
          <ThemedText style={styles.progressPercent}>{conversionProgress}%</ThemedText>
          
          <View style={styles.conversionSteps}>
            <ConversionStep 
              label="Validating tokens" 
              isComplete={conversionProgress >= 30} 
              isActive={conversionProgress < 30}
            />
            <ConversionStep 
              label="Processing conversion" 
              isComplete={conversionProgress >= 60} 
              isActive={conversionProgress >= 30 && conversionProgress < 60}
            />
            <ConversionStep 
              label="Allocating funds" 
              isComplete={conversionProgress >= 90} 
              isActive={conversionProgress >= 60 && conversionProgress < 90}
            />
            <ConversionStep 
              label="Completing transfer" 
              isComplete={conversionProgress >= 100} 
              isActive={conversionProgress >= 90 && conversionProgress < 100}
            />
          </View>
        </Animated.View>
      ) : conversionComplete ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.completeCard}>
          <View style={styles.completeIcon}>
            <Feather name="check-circle" size={32} color={Colors.dark.successBright} />
          </View>
          <ThemedText style={styles.completeTitle}>Conversion Complete</ThemedText>
          <ThemedText style={styles.completeAmount}>{cashAmount}</ThemedText>
          <ThemedText style={styles.completeSubtitle}>Available for immediate use</ThemedText>
          
          <View style={styles.fundingBadge}>
            <Feather name="zap" size={16} color={Colors.dark.successBright} />
            <ThemedText style={styles.fundingText}>15-minute funding unlocked</ThemedText>
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.creditCard}>
          <LinearGradient
            colors={["#1a2f23", "#243d2e", "#2d4a38"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.creditCardGradient}
          >
            <View style={styles.creditCardHeader}>
              <ThemedText style={styles.creditCardLabel}>AVAILABLE CREDIT LINE</ThemedText>
              <Feather name="credit-card" size={20} color={Colors.dark.successBright} />
            </View>
            <ThemedText style={styles.creditAmount}>{availableCredit}</ThemedText>
            <View style={styles.creditCardFooter}>
              <ThemedText style={styles.creditNote}>Backed by your LedgerTokens</ThemedText>
              <View style={styles.creditBadge}>
                <Feather name="shield" size={12} color={Colors.dark.successBright} />
                <ThemedText style={styles.creditBadgeText}>Secured</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.featuresCard}>
        <ThemedText style={styles.featuresTitle}>Optimus Benefits</ThemedText>
        <View style={styles.featuresList}>
          <FeatureItem icon="zap" text="15-minute funding guarantee" highlight />
          <FeatureItem icon="percent" text="Competitive interest rates" />
          <FeatureItem icon="refresh-cw" text="Flexible repayment options" />
          <FeatureItem icon="lock" text="No liquidation of assets" />
        </View>
      </Animated.View>

      <View style={styles.spacer} />

      {conversionComplete ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.successBanner}>
          <Feather name="check-circle" size={20} color={Colors.dark.successBright} />
          <ThemedText style={styles.successText}>
            Proceeding to your Dashboard...
          </ThemedText>
        </Animated.View>
      ) : !isConverting ? (
        <ConvertButton onPress={handleStartConversion} />
      ) : null}
    </AuthScreenScrollView>
  );
}

function FeatureItem({ icon, text, highlight }: { icon: keyof typeof Feather.glyphMap; text: string; highlight?: boolean }) {
  return (
    <View style={styles.featureItem}>
      <Feather name={icon} size={16} color={highlight ? Colors.dark.successBright : Colors.dark.primary} />
      <ThemedText style={[styles.featureText, highlight && styles.featureTextHighlight]}>{text}</ThemedText>
    </View>
  );
}

function ConversionStep({ label, isComplete, isActive }: { label: string; isComplete: boolean; isActive: boolean }) {
  return (
    <View style={styles.conversionStep}>
      <View style={[
        styles.conversionStepDot,
        isComplete && styles.conversionStepDotComplete,
        isActive && styles.conversionStepDotActive,
      ]}>
        {isComplete ? (
          <Feather name="check" size={10} color="#1a1a1a" />
        ) : null}
      </View>
      <ThemedText style={[
        styles.conversionStepLabel,
        isComplete && styles.conversionStepLabelComplete,
        isActive && styles.conversionStepLabelActive,
      ]}>
        {label}
      </ThemedText>
    </View>
  );
}

function ConvertButton({ onPress }: { onPress: () => void }) {
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
      style={[styles.convertButtonContainer, animatedStyle]}
    >
      <LinearGradient
        colors={["#10B981", "#34D399", "#6EE7B7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.convertButton}
      >
        <Feather name="dollar-sign" size={18} color="#1a1a1a" />
        <ThemedText style={styles.convertButtonText}>Convert to Cash</ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  header: {
    alignItems: "center",
  },
  optimusBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    color: Colors.dark.successBright,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 20,
  },
  conversionCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.successBright,
    padding: Spacing.lg,
  },
  conversionHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  conversionLabel: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 2,
  },
  conversionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  conversionSide: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  conversionArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  conversionAmount: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark.primary,
  },
  cashAmount: {
    color: Colors.dark.successBright,
  },
  conversionType: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  progressCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.successBright,
    padding: Spacing.lg,
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.dark.cream,
    marginBottom: Spacing.lg,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "300",
    color: Colors.dark.successBright,
    marginTop: Spacing.md,
  },
  conversionSteps: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  conversionStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  conversionStepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.dark.sage,
    justifyContent: "center",
    alignItems: "center",
  },
  conversionStepDotComplete: {
    backgroundColor: Colors.dark.successBright,
    borderColor: Colors.dark.successBright,
  },
  conversionStepDotActive: {
    borderColor: Colors.dark.successBright,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  conversionStepLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  conversionStepLabelComplete: {
    color: Colors.dark.successBright,
  },
  conversionStepLabelActive: {
    color: Colors.dark.successBright,
  },
  completeCard: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    padding: Spacing.xl,
    alignItems: "center",
  },
  completeIcon: {
    marginBottom: Spacing.md,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark.successBright,
    marginBottom: Spacing.sm,
  },
  completeAmount: {
    fontSize: 32,
    fontWeight: "300",
    color: Colors.dark.cream,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  completeSubtitle: {
    fontSize: 13,
    fontWeight: "300",
    color: Colors.dark.sage,
    marginBottom: Spacing.lg,
  },
  fundingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  fundingText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.successBright,
    letterSpacing: 0.3,
  },
  creditCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  creditCardGradient: {
    padding: Spacing.xl,
  },
  creditCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  creditCardLabel: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 2,
  },
  creditAmount: {
    fontSize: 32,
    fontWeight: "300",
    color: Colors.dark.successBright,
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  creditCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditNote: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  creditBadgeText: {
    fontSize: 10,
    fontWeight: "400",
    color: Colors.dark.successBright,
    letterSpacing: 0.5,
  },
  featuresCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorderGlass,
    padding: Spacing.lg,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.dark.cream,
    marginBottom: Spacing.md,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  featureTextHighlight: {
    color: Colors.dark.successBright,
    fontWeight: "400",
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xl,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  successText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.dark.successBright,
    letterSpacing: 0.3,
  },
  convertButtonContainer: {
    width: "100%",
  },
  convertButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  convertButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
});
