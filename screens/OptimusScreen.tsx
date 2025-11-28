import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Pattern, Circle } from "react-native-svg";
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

const NAVIGATION_PILLS = [
  { id: "full-wallet", label: "Full Wallet" },
  { id: "illiquid-assets", label: "Illiquid Assets" },
  { id: "ledger-token", label: "Ledger Token" },
  { id: "risk-metrics", label: "Risk Metrics" },
  { id: "blocks", label: "Blocks" },
  { id: "card-m", label: "Card M" },
  { id: "sentinel-transfer", label: "Sentinel Transfer" },
];

const ACTION_BUTTONS = [
  { id: "bank-account", label: "Bank Account" },
  { id: "transfer-pay", label: "Transfer/Pay" },
  { id: "debit-credit", label: "Debit/Credit Card" },
  { id: "invest", label: "Invest" },
];

const MARKET_DATA = [
  { id: "stock-price", label: "Nasdaq", change: "+16%", positive: true },
  { id: "interest-rates", label: "Interest Rates", change: "-20%", positive: false },
  { id: "exchange-rates", label: "Exchange Rates", change: "-3%", positive: false },
  { id: "commodities", label: "Commodities", change: "+10%", positive: true },
];

export default function OptimusScreen() {
  const { convertedAmounts } = useAuth();

  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-GB");
  };

  return (
    <AuthScreenScrollView style={styles.screenBackground} contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.backText}>Back</ThemedText>
        </View>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.title}>Optimus</ThemedText>
          <ThemedText style={styles.subtitle}>Powered by Pier</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <Feather name="user" size={20} color={Colors.dark.text} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.navigationContainer}>
        <View style={styles.navigationPills}>
          {NAVIGATION_PILLS.slice(0, 3).map((pill) => (
            <View key={pill.id} style={styles.navPill}>
              <ThemedText style={styles.navPillText}>{pill.label}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.navigationPills}>
          {NAVIGATION_PILLS.slice(3, 6).map((pill) => (
            <View key={pill.id} style={styles.navPill}>
              <ThemedText style={styles.navPillText}>{pill.label}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.navigationPills}>
          <View style={styles.navPill}>
            <ThemedText style={styles.navPillText}>{NAVIGATION_PILLS[6].label}</ThemedText>
          </View>
        </View>
      </Animated.View>

      <View style={styles.mainContent}>
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.primaryButtons}>
          <GradientButton label="Balance" />
          <GradientButton label="Converted into Cash" />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.monetarySection}>
          <View style={styles.monetaryRow}>
            <View style={styles.monetaryPill}>
              <ThemedText style={styles.monetaryText}>
                {convertedAmounts.property1Remaining > 0 
                  ? `CST ${formatNumber(convertedAmounts.property1Remaining)}`
                  : "CST 0"}
              </ThemedText>
            </View>
            <View style={[styles.monetaryPill, styles.monetaryPillBlue]}>
              <ThemedText style={styles.monetaryText}>
                {convertedAmounts.property1Converted > 0 
                  ? `£ ${formatNumber(convertedAmounts.property1Converted)}`
                  : "0"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.monetaryRow}>
            <View style={styles.monetaryPill}>
              <ThemedText style={styles.monetaryText}>
                {convertedAmounts.property2Remaining > 0 
                  ? `CST ${formatNumber(convertedAmounts.property2Remaining)}`
                  : "CST 0"}
              </ThemedText>
            </View>
            <View style={[styles.monetaryPill, styles.monetaryPillBlue]}>
              <ThemedText style={styles.monetaryText}>
                {convertedAmounts.property2Converted > 0 
                  ? `£ ${formatNumber(convertedAmounts.property2Converted)}`
                  : "0"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.addButtonsRow}>
            <View style={styles.addButtonContainer}>
              <AddButton />
            </View>
            <View style={styles.addButtonContainer}>
              <AddButton />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(250)} style={styles.actionGrid}>
          {ACTION_BUTTONS.map((button, index) => (
            <ActionButton key={button.id} label={button.label} index={index} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.chartsGrid}>
          {MARKET_DATA.map((market, index) => (
            <MarketChart key={market.id} market={market} index={index} />
          ))}
        </Animated.View>

      </View>
    </AuthScreenScrollView>
  );
}

function GradientButton({ label }: { label: string }) {
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
      style={[styles.gradientButton, animatedStyle]}
    >
      <View style={styles.gradientButtonInner}>
        <ThemedText style={styles.gradientButtonText}>{label}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

function AddButton() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[styles.addButton, animatedStyle]}
    >
      <Feather name="plus" size={12} color="#ffffff" />
    </AnimatedPressable>
  );
}

function ActionButton({ label, index }: { label: string; index: number }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[styles.actionButton, animatedStyle]}
    >
      <ThemedText style={styles.actionButtonText}>{label}</ThemedText>
    </AnimatedPressable>
  );
}

function MarketChart({ market, index }: { market: typeof MARKET_DATA[0]; index: number }) {
  const lineColor = market.positive ? "rgba(0, 255, 102, 0.8)" : "rgba(255, 68, 68, 0.8)";
  const gradientStartColor = market.positive ? "rgba(0, 255, 102, 0.3)" : "rgba(255, 68, 68, 0.3)";
  const gradientEndColor = market.positive ? "rgba(0, 255, 102, 0.02)" : "rgba(255, 68, 68, 0.02)";
  const dotColor = market.positive ? "#00ff66" : "#ff4444";

  const getChartPath = () => {
    switch (market.id) {
      case "stock-price":
        return "M 0 45 L 15 42 L 25 48 L 35 38 L 45 32 L 55 35 L 70 28 L 85 22 L 100 25 L 115 18 L 130 12 L 145 15 L 160 10 L 175 8 L 190 5 L 200 2";
      case "interest-rates":
        return "M 0 20 L 20 22 L 40 25 L 60 30 L 80 33 L 100 37 L 120 40 L 140 44 L 160 48 L 180 52 L 200 55";
      case "exchange-rates":
        return "M 0 28 L 20 30 L 40 27 L 60 32 L 80 35 L 100 33 L 120 38 L 140 40 L 160 43 L 180 45 L 200 48";
      case "commodities":
        return "M 0 35 L 15 30 L 30 38 L 45 32 L 60 30 L 75 26 L 90 25 L 105 22 L 120 18 L 135 15 L 150 12 L 165 10 L 180 8 L 200 5";
      default:
        return "";
    }
  };

  const getAreaPath = () => {
    const linePath = getChartPath();
    return `${linePath} L 200 60 L 0 60 Z`;
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartLabelContainer}>
          <ThemedText style={styles.chartLabel}>{market.label}</ThemedText>
          <View style={[styles.chartDot, { backgroundColor: "#00ff66" }]} />
        </View>
        <ThemedText style={[styles.chartChange, { color: market.positive ? "#00ff66" : "#ff4444" }]}>
          {market.change}
        </ThemedText>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width="100%" height={60} viewBox="0 0 200 60" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={`gradient-${market.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={gradientStartColor} />
              <Stop offset="100%" stopColor={gradientEndColor} />
            </LinearGradient>
            <Pattern id={`grid-${market.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <Path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
            </Pattern>
          </Defs>
          
          <Rect width="200" height="60" fill={`url(#grid-${market.id})`} />
          
          <Path
            d={getAreaPath()}
            fill={`url(#gradient-${market.id})`}
          />
          
          <Path
            d={getChartPath()}
            stroke={lineColor}
            strokeWidth={1.5}
            fill="none"
          />
          
          {market.id === "stock-price" ? (
            <>
              <Circle cx="0" cy="45" r="1.5" fill={dotColor} />
              <Circle cx="45" cy="32" r="1.5" fill={dotColor} />
              <Circle cx="100" cy="25" r="1.5" fill={dotColor} />
              <Circle cx="145" cy="15" r="1.5" fill={dotColor} />
              <Circle cx="200" cy="2" r="2" fill={dotColor} />
            </>
          ) : null}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenBackground: {
    backgroundColor: "#0d3612",
  },
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
    marginBottom: Spacing.xl,
  },
  navigationPills: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
  mainContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  primaryButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  gradientButton: {
    flex: 1,
  },
  gradientButtonInner: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "#4ade80",
    alignItems: "center",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
  },
  gradientButtonText: {
    fontSize: 11,
    fontWeight: "400",
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  monetarySection: {
    gap: Spacing.md,
  },
  monetaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  monetaryPill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(20, 54, 30, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
    alignItems: "center",
    shadowColor: "#00ff64",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  monetaryPillBlue: {
    shadowColor: "#6496ff",
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  monetaryEmpty: {
    flex: 1,
  },
  monetaryText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#E8D5B7",
    letterSpacing: 0.5,
  },
  addButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  addButtonContainer: {
    flex: 1,
    alignItems: "center",
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionButton: {
    width: "48%",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "#ece5d1",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4c5a9",
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: "400",
    color: "#5c4f3d",
    letterSpacing: 0.3,
  },
  chartsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  chartCard: {
    width: "48%",
    backgroundColor: "rgba(20, 54, 30, 0.8)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
    shadowColor: "#00ff64",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  chartLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: "400",
    color: Colors.dark.text,
    letterSpacing: 0.5,
  },
  chartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartChange: {
    fontSize: 11,
    fontWeight: "400",
  },
  chartContainer: {
    height: 60,
    overflow: "hidden",
  },
});
