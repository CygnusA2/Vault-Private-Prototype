import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
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

const NAVIGATION_PILLS = [
  { id: "full-wallet", label: "Full Wallet" },
  { id: "illiquid-assets", label: "Illiquid Assets" },
  { id: "optimus", label: "Optimus" },
  { id: "risk-metrics", label: "Risk Metrics" },
  { id: "blocks", label: "Blocks" },
  { id: "card-m", label: "Card M" },
  { id: "sentinel-transfer", label: "Sentinel Transfer" },
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

const INITIAL_PROPERTY1 = 5000000;
const INITIAL_PROPERTY2 = 2000000;

export default function LedgerTokenScreen() {
  const { setNeedsLedgerToken, setNeedsOptimus, setConvertedAmounts } = useAuth();
  
  const [property1Value, setProperty1Value] = useState(INITIAL_PROPERTY1);
  const [property2Value, setProperty2Value] = useState(INITIAL_PROPERTY2);
  const [transformed1, setTransformed1] = useState("");
  const [transformed2, setTransformed2] = useState("");
  const [transformed1Raw, setTransformed1Raw] = useState(0);
  const [transformed2Raw, setTransformed2Raw] = useState(0);
  const [reversedValue, setReversedValue] = useState("");
  const [propertyReverse, setPropertyReverse] = useState("");
  
  const [showConvertHighlight, setShowConvertHighlight] = useState(false);
  const [conversionDone, setConversionDone] = useState(false);
  const [showOptimusHighlight, setShowOptimusHighlight] = useState(false);

  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (showConvertHighlight || showOptimusHighlight) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    }
  }, [showConvertHighlight, showOptimusHighlight]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  useEffect(() => {
    const t1Num = parseFloat(transformed1.replace(/,/g, "")) || 0;
    const t2Num = parseFloat(transformed2.replace(/,/g, "")) || 0;
    
    if (t1Num > 0 || t2Num > 0) {
      setShowConvertHighlight(true);
    }
  }, [transformed1, transformed2]);

  const handleTransformed1Change = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    const numValue = parseInt(numericText) || 0;
    
    const cappedValue = Math.min(numValue, INITIAL_PROPERTY1);
    setTransformed1(numericText ? formatNumber(cappedValue) : "");
    setTransformed1Raw(cappedValue);
    setProperty1Value(INITIAL_PROPERTY1 - cappedValue);
  };

  const handleTransformed2Change = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    const numValue = parseInt(numericText) || 0;
    
    const cappedValue = Math.min(numValue, INITIAL_PROPERTY2);
    setTransformed2(numericText ? formatNumber(cappedValue) : "");
    setTransformed2Raw(cappedValue);
    setProperty2Value(INITIAL_PROPERTY2 - cappedValue);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-GB");
  };

  const formatCurrency = (num: number): string => {
    return `£ ${(num / 1000).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const handleConvertAction = (type: "partially" | "entire") => {
    const remainingProperty = property1Value + property2Value;
    const totalInitial = INITIAL_PROPERTY1 + INITIAL_PROPERTY2;
    const convertedAmount = totalInitial - remainingProperty;
    
    const property1ConvertedAmount = INITIAL_PROPERTY1 - property1Value;
    const property2ConvertedAmount = INITIAL_PROPERTY2 - property2Value;
    
    if (type === "entire") {
      setConvertedAmounts({
        convertedCash: convertedAmount,
        remainingAmount: remainingProperty,
        property1Remaining: property1Value,
        property1Converted: property1ConvertedAmount,
        property2Remaining: property2Value,
        property2Converted: property2ConvertedAmount,
      });
      setTransformed1("");
      setTransformed2("");
      setTransformed1Raw(0);
      setTransformed2Raw(0);
    } else {
      const partialAmount = Math.floor(convertedAmount / 2);
      const partialRemaining = convertedAmount - partialAmount;
      setConvertedAmounts({
        convertedCash: partialAmount,
        remainingAmount: remainingProperty + partialRemaining,
        property1Remaining: property1Value + partialRemaining,
        property1Converted: Math.floor(property1ConvertedAmount / 2),
        property2Remaining: property2Value,
        property2Converted: Math.floor(property2ConvertedAmount / 2),
      });
      if (partialRemaining > 0) {
        setTransformed1(formatNumber(partialRemaining));
        setTransformed1Raw(partialRemaining);
        setProperty1Value(property1Value);
      } else {
        setTransformed1("");
        setTransformed1Raw(0);
      }
      setTransformed2("");
      setTransformed2Raw(0);
    }
    
    setShowConvertHighlight(false);
    setConversionDone(true);
    setShowOptimusHighlight(true);
  };

  const handleOptimusPress = () => {
    setNeedsLedgerToken(false);
    setNeedsOptimus(true);
  };

  return (
    <AuthScreenScrollView style={styles.screenBackground} contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.timeText}>9:41</ThemedText>
          <ThemedText style={styles.backText}>Back</ThemedText>
        </View>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.title}>Ledger Token</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <Feather name="battery" size={18} color={Colors.dark.text} />
          <Feather name="user" size={20} color={Colors.dark.text} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.navigationContainer}>
        <View style={styles.navigationPills}>
          {NAVIGATION_PILLS.slice(0, 3).map((pill) => (
            <Pressable
              key={pill.id}
              onPress={pill.id === "optimus" && showOptimusHighlight ? handleOptimusPress : undefined}
            >
              <Animated.View 
                style={[
                  styles.navPill, 
                  pill.id === "optimus" && showOptimusHighlight && styles.navPillHighlighted,
                  pill.id === "optimus" && showOptimusHighlight && pulseStyle,
                ]}
              >
                <ThemedText style={[
                  styles.navPillText,
                  pill.id === "optimus" && showOptimusHighlight && styles.navPillTextHighlighted
                ]}>
                  {pill.label}
                </ThemedText>
                {pill.id === "optimus" && showOptimusHighlight ? (
                  <View style={styles.nextStepBadge}>
                    <Feather name="arrow-right" size={10} color="#1a1a1a" />
                  </View>
                ) : null}
              </Animated.View>
            </Pressable>
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

      <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.mainContent}>
        <View style={styles.sectionButton}>
          <ThemedText style={styles.sectionButtonText}>Transform</ThemedText>
        </View>

        <View style={styles.propertySection}>
          <View style={styles.propertyRow}>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Property 1 Value</ThemedText>
              <View style={styles.valuePillSecondary}>
                <ThemedText style={styles.valuePillText}>{formatCurrency(property1Value)}</ThemedText>
              </View>
            </View>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Transformed Value</ThemedText>
              <View style={styles.valuePillInput}>
                <TextInput
                  style={styles.inputText}
                  value={transformed1}
                  onChangeText={handleTransformed1Change}
                  placeholder="Type amount"
                  placeholderTextColor="rgba(232, 213, 183, 0.4)"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.propertyRow}>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Property 2 Value</ThemedText>
              <View style={styles.valuePillSecondary}>
                <ThemedText style={styles.valuePillText}>{formatCurrency(property2Value)}</ThemedText>
              </View>
            </View>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Transformed Value</ThemedText>
              <View style={styles.valuePillInput}>
                <TextInput
                  style={styles.inputText}
                  value={transformed2}
                  onChangeText={handleTransformed2Change}
                  placeholder="Type amount"
                  placeholderTextColor="rgba(232, 213, 183, 0.4)"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionButton}>
          <ThemedText style={styles.sectionButtonText}>Reverse</ThemedText>
        </View>

        <View style={styles.reverseSection}>
          <View style={styles.propertyRow}>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Property Value</ThemedText>
              <View style={styles.valuePillPurple}>
                <ThemedText style={styles.valuePillTextDisplay}>
                  {propertyReverse || " "}
                </ThemedText>
              </View>
            </View>
            <View style={styles.propertyColumn}>
              <ThemedText style={styles.propertyLabel}>Reversed Value</ThemedText>
              <View style={styles.valuePillCream}>
                <ThemedText style={styles.valuePillTextDisplay}>
                  {reversedValue ? `CST ${reversedValue}` : " "}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionButton}>
          <ThemedText style={styles.sectionButtonText}>Convert into Cash</ThemedText>
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.actionGrid}>
          <View style={styles.actionGridRow}>
            <AnimatedPressable
              onPress={() => handleConvertAction("partially")}
              style={[
                styles.actionButton,
                showConvertHighlight && styles.actionButtonHighlighted,
                showConvertHighlight && pulseStyle,
              ]}
            >
              <ThemedText style={[
                styles.actionButtonText,
                showConvertHighlight && styles.actionButtonTextHighlighted
              ]}>
                Partially
              </ThemedText>
              {showConvertHighlight ? (
                <View style={styles.highlightIndicator}>
                  <Feather name="edit-3" size={10} color="#1a1a1a" />
                </View>
              ) : null}
            </AnimatedPressable>
            
            <AnimatedPressable
              onPress={() => handleConvertAction("entire")}
              style={[
                styles.actionButton,
                showConvertHighlight && styles.actionButtonHighlighted,
                showConvertHighlight && pulseStyle,
              ]}
            >
              <ThemedText style={[
                styles.actionButtonText,
                showConvertHighlight && styles.actionButtonTextHighlighted
              ]}>
                Entire Amount
              </ThemedText>
              {showConvertHighlight ? (
                <View style={styles.highlightIndicator}>
                  <Feather name="edit-3" size={10} color="#1a1a1a" />
                </View>
              ) : null}
            </AnimatedPressable>
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

        {showConvertHighlight ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.hintContainer}>
            <Feather name="arrow-up" size={14} color="#4ade80" />
            <ThemedText style={styles.hintText}>
              Click Partially or Entire Amount to convert your transformed value to cash
            </ThemedText>
          </Animated.View>
        ) : null}

        {showOptimusHighlight ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.hintContainer}>
            <Feather name="arrow-up" size={14} color="#4ade80" />
            <ThemedText style={styles.hintText}>
              Tap Optimus above to see where your cash will be displayed
            </ThemedText>
          </Animated.View>
        ) : null}
      </Animated.View>
    </AuthScreenScrollView>
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
    alignItems: "flex-start",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.text,
    marginBottom: 2,
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  navPillHighlighted: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  navPillText: {
    fontSize: 11,
    fontWeight: "300",
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  navPillTextHighlighted: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  nextStepBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  sectionButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: "#4ade80",
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.md,
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 1,
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
  valuePillInput: {
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
  inputText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#E8D5B7",
    letterSpacing: 0.5,
    textAlign: "center",
    padding: 0,
  },
  valuePillPurple: {
    paddingVertical: Spacing.sm,
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
    paddingVertical: Spacing.sm,
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
  valuePillTextDisplay: {
    fontSize: 13,
    fontWeight: "400",
    color: "#E8D5B7",
    letterSpacing: 0.5,
    textAlign: "center",
    minHeight: 18,
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
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  actionButtonHighlighted: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
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
  actionButtonTextHighlighted: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  highlightIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "300",
    color: "#4ade80",
    textAlign: "center",
    flex: 1,
  },
});
