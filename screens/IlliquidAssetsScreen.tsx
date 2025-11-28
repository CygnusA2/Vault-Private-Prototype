import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeIn,
  interpolate,
} from "react-native-reanimated";
import { AuthScreenScrollView } from "@/components/AuthScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NAVIGATION_PILLS = [
  "Full Wallet",
  "Optimus",
  "Ledger Token",
  "Risk Metrics",
  "Blocks",
  "Card M",
  "Sentinel Transfer",
];

const ASSETS = [
  { id: 1, amount: "$34 M", name: "Chelsea Mansion", progress: 75, layout: "left" as const },
  { id: 2, amount: "$200 M", name: "Mona Lisa Yacht", progress: 60, layout: "right" as const },
  { id: 3, amount: "$105 M", name: "Picasso Art", progress: 85, layout: "left" as const },
];

export default function IlliquidAssetsScreen() {
  const { setNeedsIlliquidAssets, setNeedsLedgerToken } = useAuth();

  const handleTransform = () => {
    setNeedsIlliquidAssets(false);
    setNeedsLedgerToken(true);
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.backText}>Back</ThemedText>
        </View>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.title}>Illiquid Assets</ThemedText>
          <ThemedText style={styles.subtitle}>Powered by Marcus</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <Feather name="users" size={20} color={Colors.dark.text} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.navigationContainer}>
        <View style={styles.navigationPills}>
          {NAVIGATION_PILLS.slice(0, 3).map((pill, index) => (
            <View key={pill} style={styles.navPill}>
              <ThemedText style={styles.navPillText}>{pill}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.navigationPills}>
          {NAVIGATION_PILLS.slice(3, 6).map((pill, index) => (
            <View key={pill} style={styles.navPill}>
              <ThemedText style={styles.navPillText}>{pill}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.navigationPillsCenter}>
          <View key={NAVIGATION_PILLS[6]} style={styles.navPill}>
            <ThemedText style={styles.navPillText}>{NAVIGATION_PILLS[6]}</ThemedText>
          </View>
        </View>
      </Animated.View>

      <View style={styles.assetsContainer}>
        {ASSETS.map((asset, index) => (
          <AssetRow key={asset.id} asset={asset} index={index} />
        ))}
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.transformButtonContainer}>
          <TransformButton onPress={handleTransform} />
        </View>
        <View style={styles.cylindersContainer}>
          <Cylinder delay={600} />
          <View style={styles.cylinderSpacer} />
          <Cylinder delay={800} />
        </View>
      </View>
    </AuthScreenScrollView>
  );
}

function AssetRow({ asset, index }: { asset: typeof ASSETS[0]; index: number }) {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(
      index * 150 + 300,
      withTiming(asset.progress, { duration: 1000 })
    );
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const circleScale = useSharedValue(0.8);
  
  useEffect(() => {
    circleScale.value = withDelay(
      index * 150 + 200,
      withSpring(1, { damping: 12 })
    );
  }, []);

  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(index * 150 + 200)} 
      style={styles.assetRow}
    >
      {asset.layout === "left" ? (
        <>
          <Animated.View style={[styles.amountCircle, circleAnimStyle]}>
            <LinearGradient
              colors={["#4ade80", "#22c55e"]}
              style={styles.circleGradient}
            >
              <ThemedText style={styles.amountText}>{asset.amount}</ThemedText>
            </LinearGradient>
          </Animated.View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, progressStyle]}>
                <LinearGradient
                  colors={["#4ade80", "#22c55e"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          <View style={styles.assetNamePill}>
            <ThemedText style={styles.assetNameText}>{asset.name}</ThemedText>
          </View>
        </>
      ) : (
        <>
          <View style={styles.assetNamePill}>
            <ThemedText style={styles.assetNameText}>{asset.name}</ThemedText>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, progressStyle]}>
                <LinearGradient
                  colors={["#4ade80", "#22c55e"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          <Animated.View style={[styles.amountCircle, circleAnimStyle]}>
            <LinearGradient
              colors={["#4ade80", "#22c55e"]}
              style={styles.circleGradient}
            >
              <ThemedText style={styles.amountText}>{asset.amount}</ThemedText>
            </LinearGradient>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

function Cylinder({ delay }: { delay: number }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cylinder, animStyle]}>
      <LinearGradient
        colors={["#6b7280", "#d1d5db", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.cylinderBody}
      >
        <View style={styles.cylinderTopHighlight} />
        <View style={styles.cylinderBottomShadow} />
      </LinearGradient>
    </Animated.View>
  );
}

function TransformButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    buttonOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: buttonOpacity.value,
  }));

  return (
    <Animated.View entering={FadeIn.duration(500).delay(700)} style={animatedStyle}>
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
        style={styles.transformButtonWrapper}
      >
        <LinearGradient
          colors={["#4ade80", "#22c55e"]}
          style={styles.transformButton}
        >
          <ThemedText style={styles.transformButtonText}>Transform</ThemedText>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing["3xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  backText: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.dark.text,
  },
  headerCenter: {
    alignItems: "center",
    flex: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  navigationContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  navigationPills: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  navigationPillsCenter: {
    flexDirection: "row",
    justifyContent: "center",
  },
  navPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
  },
  navPillText: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  assetsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    marginBottom: Spacing["3xl"],
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  amountCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  circleGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 28,
  },
  amountText: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.text,
    letterSpacing: 0.2,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    justifyContent: "center",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressGradient: {
    flex: 1,
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  assetNamePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(20, 54, 30, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
  },
  assetNameText: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  bottomSection: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    alignItems: "flex-start",
    marginTop: Spacing.xl,
  },
  transformButtonContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 40,
  },
  transformButtonWrapper: {
    overflow: "hidden",
    borderRadius: BorderRadius.full,
  },
  transformButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  transformButtonText: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.text,
    letterSpacing: 0.5,
  },
  cylindersContainer: {
    alignItems: "flex-end",
    paddingRight: Spacing.lg,
  },
  cylinderSpacer: {
    height: Spacing.md,
  },
  cylinder: {
    width: 48,
    height: 64,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#6b7280",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
  },
  cylinderBody: {
    flex: 1,
    borderRadius: 24,
    position: "relative",
    overflow: "hidden",
  },
  cylinderTopHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cylinderBottomShadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
