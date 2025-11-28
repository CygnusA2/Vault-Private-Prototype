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

export default function LedgerTokenScreen() {
  const { setNeedsLedgerToken, setNeedsOptimus } = useAuth();
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [tokenizationProgress, setTokenizationProgress] = useState(0);
  const [tokenizationComplete, setTokenizationComplete] = useState(false);
  const rotateAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  const tokenValue = "8,920,000";
  const ledgerTokens = "8,920";
  const conversionRate = "1 LT = $1,000";

  useEffect(() => {
    if (isTokenizing) {
      rotateAnim.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
      scaleAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    }
  }, [isTokenizing]);

  useEffect(() => {
    if (tokenizationComplete) {
      const timer = setTimeout(() => {
        setNeedsLedgerToken(false);
        setNeedsOptimus(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tokenizationComplete]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handleStartTokenization = () => {
    if (isTokenizing || tokenizationComplete) return;
    
    setIsTokenizing(true);
    setTokenizationProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setTokenizationProgress(Math.min(progress, 100));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsTokenizing(false);
          setTokenizationComplete(true);
        }, 500);
      }
    }, 60);
  };

  const handleContinue = () => {
    setNeedsLedgerToken(false);
    setNeedsOptimus(true);
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
        <Animated.View style={[styles.tokenBadge, isTokenizing && scaleStyle]}>
          {isTokenizing ? (
            <Animated.View style={rotateStyle}>
              <Feather name="loader" size={32} color={Colors.dark.primary} />
            </Animated.View>
          ) : tokenizationComplete ? (
            <Feather name="check-circle" size={32} color={Colors.dark.successBright} />
          ) : (
            <Feather name="hexagon" size={32} color={Colors.dark.primary} />
          )}
        </Animated.View>
        <ThemedText style={styles.title}>LedgerToken</ThemedText>
        <ThemedText style={styles.subtitle}>
          {tokenizationComplete 
            ? "Your assets have been successfully tokenized"
            : "Convert your verified illiquid assets into secure LedgerTokens"
          }
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.conversionCard}>
        <View style={styles.conversionHeader}>
          <ThemedText style={styles.conversionLabel}>ASSET TO TOKEN CONVERSION</ThemedText>
        </View>
        
        <View style={styles.conversionContent}>
          <View style={styles.conversionSide}>
            <Feather name="briefcase" size={24} color={Colors.dark.cream} />
            <ThemedText style={styles.conversionAmount}>${tokenValue}</ThemedText>
            <ThemedText style={styles.conversionType}>Illiquid Assets</ThemedText>
          </View>
          
          <View style={styles.conversionArrow}>
            <Feather name="arrow-right" size={20} color={Colors.dark.primary} />
          </View>
          
          <View style={styles.conversionSide}>
            <Feather name="hexagon" size={24} color={Colors.dark.primary} />
            <ThemedText style={[styles.conversionAmount, styles.tokenAmount]}>{ledgerTokens} LT</ThemedText>
            <ThemedText style={styles.conversionType}>LedgerTokens</ThemedText>
          </View>
        </View>

        <View style={styles.rateContainer}>
          <Feather name="info" size={14} color={Colors.dark.sage} />
          <ThemedText style={styles.rateText}>Conversion Rate: {conversionRate}</ThemedText>
        </View>
      </Animated.View>

      {isTokenizing ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.progressCard}>
          <ThemedText style={styles.progressTitle}>Tokenization in Progress</ThemedText>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={[Colors.dark.primary, "#D4B872"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${tokenizationProgress}%` }]}
            />
          </View>
          <ThemedText style={styles.progressPercent}>{tokenizationProgress}%</ThemedText>
          
          <View style={styles.progressSteps}>
            <ProgressStep 
              label="Verifying assets" 
              isComplete={tokenizationProgress >= 25} 
              isActive={tokenizationProgress < 25}
            />
            <ProgressStep 
              label="Creating tokens" 
              isComplete={tokenizationProgress >= 50} 
              isActive={tokenizationProgress >= 25 && tokenizationProgress < 50}
            />
            <ProgressStep 
              label="Securing on ledger" 
              isComplete={tokenizationProgress >= 75} 
              isActive={tokenizationProgress >= 50 && tokenizationProgress < 75}
            />
            <ProgressStep 
              label="Finalizing" 
              isComplete={tokenizationProgress >= 100} 
              isActive={tokenizationProgress >= 75 && tokenizationProgress < 100}
            />
          </View>
        </Animated.View>
      ) : tokenizationComplete ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.completeCard}>
          <View style={styles.completeIcon}>
            <Feather name="shield" size={28} color={Colors.dark.successBright} />
          </View>
          <ThemedText style={styles.completeTitle}>Tokenization Complete</ThemedText>
          <ThemedText style={styles.completeSubtitle}>
            Your {ledgerTokens} LedgerTokens are now secured on the distributed ledger
          </ThemedText>
          
          <View style={styles.tokenStats}>
            <View style={styles.tokenStat}>
              <ThemedText style={styles.tokenStatValue}>{ledgerTokens}</ThemedText>
              <ThemedText style={styles.tokenStatLabel}>Total LT</ThemedText>
            </View>
            <View style={styles.tokenStatDivider} />
            <View style={styles.tokenStat}>
              <ThemedText style={styles.tokenStatValue}>100%</ThemedText>
              <ThemedText style={styles.tokenStatLabel}>Verified</ThemedText>
            </View>
            <View style={styles.tokenStatDivider} />
            <View style={styles.tokenStat}>
              <ThemedText style={styles.tokenStatValue}>Secured</ThemedText>
              <ThemedText style={styles.tokenStatLabel}>Status</ThemedText>
            </View>
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.benefitsCard}>
          <ThemedText style={styles.benefitsTitle}>Token Benefits</ThemedText>
          <View style={styles.benefitsList}>
            <BenefitItem icon="shield" text="Secured on distributed ledger" />
            <BenefitItem icon="zap" text="Instant liquidity access" />
            <BenefitItem icon="lock" text="Bank-grade encryption" />
            <BenefitItem icon="refresh-cw" text="Reversible at any time" />
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.infoCard}>
        <Feather name="shield" size={18} color={Colors.dark.primary} />
        <ThemedText style={styles.infoText}>
          LedgerTokens are backed 1:1 by your verified illiquid assets and can be instantly converted to Optimus cash at any time.
        </ThemedText>
      </Animated.View>

      <View style={styles.spacer} />

      {tokenizationComplete ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.successBanner}>
          <Feather name="arrow-right-circle" size={20} color={Colors.dark.successBright} />
          <ThemedText style={styles.successText}>
            Proceeding to Optimus conversion...
          </ThemedText>
        </Animated.View>
      ) : !isTokenizing ? (
        <TokenizeButton onPress={handleStartTokenization} />
      ) : null}
    </AuthScreenScrollView>
  );
}

function BenefitItem({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Feather name={icon} size={16} color={Colors.dark.primary} />
      <ThemedText style={styles.benefitText}>{text}</ThemedText>
    </View>
  );
}

function ProgressStep({ label, isComplete, isActive }: { label: string; isComplete: boolean; isActive: boolean }) {
  return (
    <View style={styles.progressStep}>
      <View style={[
        styles.progressStepDot,
        isComplete && styles.progressStepDotComplete,
        isActive && styles.progressStepDotActive,
      ]}>
        {isComplete ? (
          <Feather name="check" size={10} color="#1a1a1a" />
        ) : null}
      </View>
      <ThemedText style={[
        styles.progressStepLabel,
        isComplete && styles.progressStepLabelComplete,
        isActive && styles.progressStepLabelActive,
      ]}>
        {label}
      </ThemedText>
    </View>
  );
}

function TokenizeButton({ onPress }: { onPress: () => void }) {
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
      style={[styles.tokenizeButtonContainer, animatedStyle]}
    >
      <LinearGradient
        colors={[Colors.dark.primary, "#D4B872", "#E5C88A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.tokenizeButton}
      >
        <Feather name="hexagon" size={18} color="#1a1a1a" />
        <ThemedText style={styles.tokenizeButtonText}>Start Tokenization</ThemedText>
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
  tokenBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(201, 169, 97, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(201, 169, 97, 0.3)",
  },
  title: {
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
    lineHeight: 20,
  },
  conversionCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
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
    backgroundColor: "rgba(201, 169, 97, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  conversionAmount: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark.cream,
  },
  tokenAmount: {
    color: Colors.dark.primary,
  },
  conversionType: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  rateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.cardBorderGlass,
  },
  rateText: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  progressCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
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
    color: Colors.dark.primary,
    marginTop: Spacing.md,
  },
  progressSteps: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressStepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.dark.sage,
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepDotComplete: {
    backgroundColor: Colors.dark.successBright,
    borderColor: Colors.dark.successBright,
  },
  progressStepDotActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(201, 169, 97, 0.2)",
  },
  progressStepLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  progressStepLabelComplete: {
    color: Colors.dark.successBright,
  },
  progressStepLabelActive: {
    color: Colors.dark.primary,
  },
  completeCard: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    padding: Spacing.xl,
    alignItems: "center",
  },
  completeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark.successBright,
    marginBottom: Spacing.sm,
  },
  completeSubtitle: {
    fontSize: 13,
    fontWeight: "300",
    color: Colors.dark.sage,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  tokenStats: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  tokenStat: {
    flex: 1,
    alignItems: "center",
  },
  tokenStatValue: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark.cream,
  },
  tokenStatLabel: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    marginTop: 2,
  },
  tokenStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.dark.cardBorderGlass,
  },
  benefitsCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorderGlass,
    padding: Spacing.lg,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.dark.cream,
    marginBottom: Spacing.md,
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    backgroundColor: "rgba(201, 169, 97, 0.05)",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(201, 169, 97, 0.2)",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.sage,
    lineHeight: 18,
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
  tokenizeButtonContainer: {
    width: "100%",
  },
  tokenizeButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  tokenizeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
});
