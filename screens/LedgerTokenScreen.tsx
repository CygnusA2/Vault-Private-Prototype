import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
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
  { id: "optimus", label: "Optimus" },
  { id: "risk-metrics", label: "Risk Metrics" },
  { id: "blocks", label: "Blocks" },
  { id: "card-m", label: "Card M" },
  { id: "sentinel", label: "Sentinel" },
];

const ACTION_BUTTONS = [
  { id: "partially", label: "Partially" },
  { id: "entire-amount", label: "Entire Amount" },
  { id: "bank-account", label: "Bank Account" },
  { id: "savings", label: "Savings" },
  { id: "debit-credit-card", label: "Debit/Credit Card" },
  { id: "invest", label: "Invest" },
  { id: "transfer", label: "Transfer", fullWidth: true },
];

export default function LedgerTokenScreen() {
  const { setNeedsLedgerToken, setNeedsOptimus } = useAuth();
  const [transformActive, setTransformActive] = useState(false);
  const [reverseActive, setReverseActive] = useState(false);
  const [convertActive, setConvertActive] = useState(false);

  const handleTransform = () => {
    setTransformActive(true);
    setTimeout(() => setTransformActive(false), 500);
  };

  const handleReverse = () => {
    setReverseActive(true);
    setTimeout(() => setReverseActive(false), 500);
  };

  const handleConvert = () => {
    setConvertActive(true);
    setTimeout(() => {
      setConvertActive(false);
      setNeedsLedgerToken(false);
      setNeedsOptimus(true);
    }, 1500);
  };

  return (
    <AuthScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.backText}>Back</ThemedText>
        </View>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.title}>Ledger Token</ThemedText>
          <ThemedText style={styles.subtitle}>Powered by Peter</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <Feather name="user" size={20} color={Colors.dark.text} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.navigationContainer}>
        <View style={styles.navigationPills}>
          {NAVIGATION_PILLS.slice(0, 3).map((pill) => (
            <View 
              key={pill.id} 
              style={[
                styles.navPill, 
                pill.id === "optimus" && styles.navPillActive
              ]}
            >
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
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.mainContent}>
        <PrimaryButton 
          label="Transform" 
          onPress={handleTransform} 
          isActive={transformActive}
        />

        <View style={styles.propertySection}>
          <View style={styles.propertyRow}>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Property 1 Value</ThemedText>
              <View style={styles.valuePillSecondary}>
                <ThemedText style={styles.valuePillText}>£ 5,000.000</ThemedText>
              </View>
            </View>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Transformed Value</ThemedText>
              <View style={styles.valuePillGreen}>
                <ThemedText style={styles.valuePillText}>CST 3,000</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.propertyRow}>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Property 2 Value</ThemedText>
              <View style={styles.valuePillSecondary}>
                <ThemedText style={styles.valuePillText}>£ 2,000.000</ThemedText>
              </View>
            </View>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Transformed Value</ThemedText>
              <View style={styles.valuePillGreen}>
                <ThemedText style={styles.valuePillText}>CST 150,000</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <PrimaryButton 
          label="Reverse" 
          onPress={handleReverse}
          isActive={reverseActive}
        />

        <View style={styles.reverseSection}>
          <View style={styles.propertyRow}>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Property Value</ThemedText>
              <View style={styles.valuePillPurple}>
                <ThemedText style={styles.valuePillTextEmpty}> </ThemedText>
              </View>
            </View>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Reversed Value</ThemedText>
              <View style={styles.valuePillCream}>
                <ThemedText style={styles.valuePillTextEmpty}> </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <PrimaryButton 
          label="Convert into Cash" 
          onPress={handleConvert}
          isActive={convertActive}
        />

        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.actionGrid}>
          <View style={styles.actionGridRow}>
            {ACTION_BUTTONS.slice(0, 2).map((btn) => (
              <ActionButton key={btn.id} label={btn.label} />
            ))}
          </View>
          <View style={styles.actionGridRow}>
            {ACTION_BUTTONS.slice(2, 4).map((btn) => (
              <ActionButton key={btn.id} label={btn.label} />
            ))}
          </View>
          <View style={styles.actionGridRow}>
            {ACTION_BUTTONS.slice(4, 6).map((btn) => (
              <ActionButton key={btn.id} label={btn.label} />
            ))}
          </View>
          <View style={styles.actionGridRowFull}>
            <ActionButton label="Transfer" fullWidth />
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(400)} style={styles.screenNavigation}>
        <View style={styles.navDot} />
        <View style={[styles.navDot, styles.navDotActive]} />
        <View style={styles.navDot} />
        <View style={styles.navDot} />
      </Animated.View>
    </AuthScreenScrollView>
  );
}

function PrimaryButton({ 
  label, 
  onPress, 
  isActive = false 
}: { 
  label: string; 
  onPress: () => void; 
  isActive?: boolean;
}) {
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
      onPress={onPress}
      style={[styles.primaryButton, animatedStyle]}
    >
      <LinearGradient
        colors={isActive ? ["#22c55e", "#4ade80"] : ["#4ade80", "#22c55e"]}
        style={styles.primaryButtonGradient}
      >
        <ThemedText style={styles.primaryButtonText}>{label}</ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function ActionButton({ label, fullWidth = false }: { label: string; fullWidth?: boolean }) {
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
      style={[
        styles.actionButton, 
        fullWidth && styles.actionButtonFullWidth,
        animatedStyle
      ]}
    >
      <ThemedText style={styles.actionButtonText}>{label}</ThemedText>
    </AnimatedPressable>
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
  navPillActive: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderColor: "rgba(74, 222, 128, 0.5)",
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
  primaryButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.dark.text,
    letterSpacing: 0.5,
  },
  propertySection: {
    gap: Spacing.xl,
  },
  propertyRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  propertyColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  propertyLabel: {
    fontSize: 10,
    fontWeight: "300",
    color: "#A8C4B5",
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },
  valuePillSecondary: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 3,
  },
  valuePillGreen: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(20, 54, 30, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
    shadowColor: "#00ff64",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  valuePillPurple: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(20, 54, 30, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
    shadowColor: "#c8b4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 3,
  },
  valuePillCream: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(20, 54, 30, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
    shadowColor: "#fffaf0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 3,
  },
  valuePillText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#E8D5B7",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  valuePillTextEmpty: {
    fontSize: 13,
    fontWeight: "400",
    color: "#E8D5B7",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  reverseSection: {
    marginTop: Spacing.sm,
  },
  actionGrid: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  actionGridRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionGridRowFull: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(20, 54, 30, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(168, 196, 181, 0.3)",
    alignItems: "center",
  },
  actionButtonFullWidth: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  screenNavigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing["2xl"],
    paddingVertical: Spacing.md,
  },
  navDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(168, 196, 181, 0.3)",
  },
  navDotActive: {
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
});
