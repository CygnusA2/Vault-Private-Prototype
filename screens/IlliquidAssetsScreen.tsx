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
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { AuthScreenScrollView } from "@/components/AuthScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ILLIQUID_ASSETS = [
  { 
    id: "realestate", 
    name: "Real Estate Portfolio", 
    value: "$4,250,000",
    type: "Property",
    status: "verified",
    icon: "home" as const,
  },
  { 
    id: "art", 
    name: "Art Collection", 
    value: "$1,850,000",
    type: "Fine Art",
    status: "pending",
    icon: "image" as const,
  },
  { 
    id: "privateeq", 
    name: "Private Equity Holdings", 
    value: "$2,500,000",
    type: "Investment",
    status: "verified",
    icon: "briefcase" as const,
  },
  { 
    id: "wine", 
    name: "Wine Collection", 
    value: "$320,000",
    type: "Collectibles",
    status: "pending",
    icon: "droplet" as const,
  },
];

export default function IlliquidAssetsScreen() {
  const { setNeedsIlliquidAssets, setNeedsLedgerToken } = useAuth();
  const [analyzedAssets, setAnalyzedAssets] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const pulseAnim = useSharedValue(1);

  const totalValue = "$8,920,000";
  const verifiedAssets = ILLIQUID_ASSETS.filter(a => analyzedAssets.includes(a.id)).length;
  const allAnalyzed = analyzedAssets.length === ILLIQUID_ASSETS.length;

  useEffect(() => {
    if (isAnalyzing) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (allAnalyzed) {
      const timer = setTimeout(() => {
        setNeedsIlliquidAssets(false);
        setNeedsLedgerToken(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allAnalyzed]);

  const handleAnalyzeAsset = (assetId: string) => {
    if (analyzedAssets.includes(assetId) || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setCurrentAnalysis(assetId);
    
    setTimeout(() => {
      setAnalyzedAssets(prev => [...prev, assetId]);
      setIsAnalyzing(false);
      setCurrentAnalysis(null);
    }, 1500);
  };

  const handleAnalyzeAll = () => {
    if (isAnalyzing) return;
    
    const remaining = ILLIQUID_ASSETS.filter(a => !analyzedAssets.includes(a.id));
    if (remaining.length === 0) return;

    setIsAnalyzing(true);
    let index = 0;

    const analyzeNext = () => {
      if (index >= remaining.length) {
        setIsAnalyzing(false);
        setCurrentAnalysis(null);
        return;
      }
      
      setCurrentAnalysis(remaining[index].id);
      setTimeout(() => {
        setAnalyzedAssets(prev => [...prev, remaining[index].id]);
        index++;
        analyzeNext();
      }, 800);
    };

    analyzeNext();
  };

  const handleContinue = () => {
    setNeedsIlliquidAssets(false);
    setNeedsLedgerToken(true);
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
        <View style={styles.iconBadge}>
          <Feather name="layers" size={28} color={Colors.dark.primary} />
        </View>
        <ThemedText style={styles.title}>Illiquid Assets</ThemedText>
        <ThemedText style={styles.subtitle}>
          AI Agent is analyzing your illiquid asset portfolio for tokenization eligibility
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>TOTAL PORTFOLIO VALUE</ThemedText>
          <ThemedText style={styles.summaryValue}>{totalValue}</ThemedText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>ASSETS VERIFIED</ThemedText>
          <ThemedText style={styles.summaryValue}>{verifiedAssets} / {ILLIQUID_ASSETS.length}</ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionLabel}>ASSET PORTFOLIO</ThemedText>
          {!allAnalyzed ? (
            <Pressable onPress={handleAnalyzeAll} disabled={isAnalyzing}>
              <ThemedText style={[styles.analyzeAllText, isAnalyzing && styles.textDisabled]}>
                Analyze All
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
        
        <View style={styles.assetsList}>
          {ILLIQUID_ASSETS.map((asset, index) => (
            <AssetItem
              key={asset.id}
              asset={asset}
              isAnalyzed={analyzedAssets.includes(asset.id)}
              isAnalyzing={currentAnalysis === asset.id}
              onAnalyze={() => handleAnalyzeAsset(asset.id)}
              delay={index * 100}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.infoCard}>
        <Feather name="cpu" size={18} color={Colors.dark.primary} />
        <ThemedText style={styles.infoText}>
          Our AI Agent verifies asset authenticity, ownership documentation, and calculates tokenization potential based on market conditions.
        </ThemedText>
      </Animated.View>

      <View style={styles.spacer} />

      {allAnalyzed ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.successBanner}>
          <Feather name="check-circle" size={20} color={Colors.dark.successBright} />
          <ThemedText style={styles.successText}>
            All assets verified - Proceeding to tokenization...
          </ThemedText>
        </Animated.View>
      ) : (
        <ContinueButton onPress={handleContinue} disabled={!allAnalyzed} />
      )}
    </AuthScreenScrollView>
  );
}

function AssetItem({
  asset,
  isAnalyzed,
  isAnalyzing,
  onAnalyze,
  delay,
}: {
  asset: typeof ILLIQUID_ASSETS[0];
  isAnalyzed: boolean;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isAnalyzing) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isAnalyzing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseAnim.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <AnimatedPressable
        onPressIn={() => {
          if (!isAnalyzed && !isAnalyzing) scale.value = withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onAnalyze}
        disabled={isAnalyzed || isAnalyzing}
        style={[
          styles.assetItem,
          isAnalyzed && styles.assetItemAnalyzed,
          isAnalyzing && styles.assetItemAnalyzing,
          animatedStyle,
        ]}
      >
        <View style={[styles.assetIcon, isAnalyzed && styles.assetIconAnalyzed]}>
          <Feather 
            name={asset.icon} 
            size={22} 
            color={isAnalyzed ? Colors.dark.successBright : Colors.dark.cream} 
          />
        </View>
        <View style={styles.assetInfo}>
          <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
          <View style={styles.assetMeta}>
            <ThemedText style={styles.assetType}>{asset.type}</ThemedText>
            <ThemedText style={styles.assetDot}>{"\u2022"}</ThemedText>
            <ThemedText style={styles.assetValue}>{asset.value}</ThemedText>
          </View>
        </View>
        <View style={styles.assetStatus}>
          {isAnalyzing ? (
            <View style={styles.analyzingBadge}>
              <Feather name="loader" size={14} color={Colors.dark.primary} />
            </View>
          ) : isAnalyzed ? (
            <Feather name="check-circle" size={20} color={Colors.dark.successBright} />
          ) : (
            <ThemedText style={styles.tapToAnalyze}>Tap to analyze</ThemedText>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
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
          Analyze all assets to continue
        </ThemedText>
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
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(201, 169, 97, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
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
  summaryCard: {
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 1.5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark.cream,
    letterSpacing: 0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.dark.cardBorderGlass,
    marginVertical: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.sage,
    letterSpacing: 2,
  },
  analyzeAllText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.dark.primary,
    letterSpacing: 0.5,
  },
  textDisabled: {
    opacity: 0.5,
  },
  assetsList: {
    gap: Spacing.md,
  },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.dark.cardGlass,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorderGlass,
    padding: Spacing.md,
  },
  assetItemAnalyzed: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  assetItemAnalyzing: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(201, 169, 97, 0.05)",
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  assetIconAnalyzed: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.dark.cream,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  assetMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  assetType: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.sage,
  },
  assetDot: {
    fontSize: 11,
    color: Colors.dark.sage,
  },
  assetValue: {
    fontSize: 11,
    fontWeight: "400",
    color: Colors.dark.primary,
  },
  assetStatus: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  analyzingBadge: {
    padding: Spacing.xs,
  },
  tapToAnalyze: {
    fontSize: 10,
    fontWeight: "300",
    color: Colors.dark.textTertiary,
    letterSpacing: 0.3,
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
  continueButtonContainer: {
    width: "100%",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  continueButtonTextDisabled: {
    color: "#999",
  },
});
