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
import { TokenizationProgress } from "@/components/TokenizationProgress";
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
  
  const [showTokenization, setShowTokenization] = useState(false);
  const [tokenizationAsset, setTokenizationAsset] = useState({ name: "", value: 0 });
  const [tokensReady, setTokensReady] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(0);
  
  const [showConversion, setShowConversion] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionType, setConversionType] = useState<"partially" | "entire">("entire");
  const [convertedUSD, setConvertedUSD] = useState(0);

  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (showConvertHighlight || showOptimusHighlight || tokensReady) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    }
  }, [showConvertHighlight, showOptimusHighlight, tokensReady]);

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
    const usdAmount = type === "entire" ? tokenAmount * 100 : Math.floor(tokenAmount * 50);
    setConversionType(type);
    setConvertedUSD(usdAmount);
    setConversionProgress(0);
    setShowConversion(true);
    
    const stages = [
      { progress: 15, delay: 800 },
      { progress: 35, delay: 1200 },
      { progress: 55, delay: 1000 },
      { progress: 75, delay: 1200 },
      { progress: 90, delay: 800 },
      { progress: 100, delay: 600 },
    ];
    
    let totalDelay = 0;
    stages.forEach((stage) => {
      totalDelay += stage.delay;
      setTimeout(() => {
        setConversionProgress(stage.progress);
      }, totalDelay);
    });
    
    setTimeout(() => {
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
      
      setTimeout(() => {
        setShowConversion(false);
        setShowConvertHighlight(false);
        setConversionDone(true);
        setShowOptimusHighlight(true);
      }, 1500);
    }, totalDelay + 500);
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
        <Pressable 
          style={styles.sectionButton}
          onPress={() => {
            const totalTransformed = transformed1Raw + transformed2Raw;
            if (totalTransformed > 0) {
              setTokenizationAsset({
                name: transformed1Raw > 0 && transformed2Raw > 0 
                  ? "Property 1 & 2 Portfolio" 
                  : transformed1Raw > 0 
                    ? "Property 1 - Beverly Hills Estate"
                    : "Property 2 - Malibu Residence",
                value: totalTransformed,
              });
              setShowTokenization(true);
            }
          }}
        >
          <ThemedText style={styles.sectionButtonText}>Transform</ThemedText>
          {(transformed1Raw > 0 || transformed2Raw > 0) ? (
            <View style={styles.transformReadyBadge}>
              <Feather name="zap" size={14} color="#ffffff" />
            </View>
          ) : null}
        </Pressable>

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
              onPress={() => {
                handleConvertAction("partially");
                setTokensReady(false);
              }}
              style={[
                styles.actionButton,
                (showConvertHighlight || tokensReady) && styles.actionButtonHighlighted,
                (showConvertHighlight || tokensReady) && pulseStyle,
              ]}
            >
              {tokensReady ? (
                <View style={styles.tokenConvertIcon}>
                  <Feather name="pie-chart" size={14} color="#1a1a1a" />
                </View>
              ) : null}
              <ThemedText style={[
                styles.actionButtonText,
                (showConvertHighlight || tokensReady) && styles.actionButtonTextHighlighted
              ]}>
                Partially
              </ThemedText>
              {showConvertHighlight && !tokensReady ? (
                <View style={styles.highlightIndicator}>
                  <Feather name="edit-3" size={10} color="#1a1a1a" />
                </View>
              ) : null}
            </AnimatedPressable>
            
            <AnimatedPressable
              onPress={() => {
                handleConvertAction("entire");
                setTokensReady(false);
              }}
              style={[
                styles.actionButton,
                (showConvertHighlight || tokensReady) && styles.actionButtonHighlighted,
                (showConvertHighlight || tokensReady) && pulseStyle,
              ]}
            >
              {tokensReady ? (
                <View style={styles.tokenConvertIcon}>
                  <Feather name="dollar-sign" size={14} color="#1a1a1a" />
                </View>
              ) : null}
              <ThemedText style={[
                styles.actionButtonText,
                (showConvertHighlight || tokensReady) && styles.actionButtonTextHighlighted
              ]}>
                Entire Amount
              </ThemedText>
              {showConvertHighlight && !tokensReady ? (
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

        {tokensReady ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.tokensReadyContainer}>
            <View style={styles.tokensReadyHeader}>
              <Feather name="check-circle" size={18} color="#4ade80" />
              <ThemedText style={styles.tokensReadyTitle}>
                {tokenAmount.toLocaleString()} VLT-RE Tokens Ready
              </ThemedText>
            </View>
            <ThemedText style={styles.tokensReadySubtext}>
              Convert your tokens to USD cash
            </ThemedText>
            <View style={styles.conversionOptionsRow}>
              <View style={styles.conversionOption}>
                <Feather name="pie-chart" size={16} color="#4ade80" />
                <ThemedText style={styles.conversionOptionText}>Partially - Convert 50%</ThemedText>
              </View>
              <View style={styles.conversionOption}>
                <Feather name="dollar-sign" size={16} color="#4ade80" />
                <ThemedText style={styles.conversionOptionText}>Entire - Convert 100%</ThemedText>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {showConvertHighlight && !tokensReady ? (
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

      <TokenizationProgress
        isActive={showTokenization}
        assetValue={tokenizationAsset.value}
        assetName={tokenizationAsset.name}
        onComplete={() => {
          setShowTokenization(false);
          setTokensReady(true);
          setTokenAmount(Math.floor(tokenizationAsset.value / 100));
          setShowConvertHighlight(false);
        }}
        onClose={() => setShowTokenization(false)}
      />

      {showConversion ? (
        <View style={styles.conversionOverlay}>
          <View style={styles.conversionModal}>
            <LinearGradient
              colors={["rgba(13, 54, 18, 0.98)", "rgba(20, 70, 30, 0.95)"]}
              style={styles.conversionGradient}
            >
              <View style={styles.conversionHeader}>
                <View style={styles.conversionIconContainer}>
                  <Feather name="refresh-cw" size={28} color="#4ade80" />
                </View>
                <ThemedText style={styles.conversionTitle}>
                  Converting to USD
                </ThemedText>
                <ThemedText style={styles.conversionSubtitle}>
                  {conversionType === "entire" ? "100% Conversion" : "50% Partial Conversion"}
                </ThemedText>
              </View>

              <View style={styles.conversionAmounts}>
                <View style={styles.conversionFromTo}>
                  <View style={styles.conversionAmount}>
                    <ThemedText style={styles.conversionLabel}>From Tokens</ThemedText>
                    <ThemedText style={styles.conversionValue}>
                      {(conversionType === "entire" ? tokenAmount : Math.floor(tokenAmount / 2)).toLocaleString()} VLT-RE
                    </ThemedText>
                  </View>
                  <Feather name="arrow-right" size={24} color="#4ade80" />
                  <View style={styles.conversionAmount}>
                    <ThemedText style={styles.conversionLabel}>To USD Cash</ThemedText>
                    <ThemedText style={styles.conversionValueUSD}>
                      ${convertedUSD.toLocaleString()}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.conversionProgressContainer}>
                <View style={styles.conversionProgressBar}>
                  <View 
                    style={[
                      styles.conversionProgressFill, 
                      { width: `${conversionProgress}%` }
                    ]} 
                  />
                </View>
                <ThemedText style={styles.conversionProgressText}>
                  {conversionProgress}%
                </ThemedText>
              </View>

              <View style={styles.conversionSteps}>
                <View style={[styles.conversionStep, conversionProgress >= 15 && styles.conversionStepActive]}>
                  <Feather name={conversionProgress >= 15 ? "check-circle" : "circle"} size={16} color={conversionProgress >= 15 ? "#4ade80" : "#666"} />
                  <ThemedText style={[styles.conversionStepText, conversionProgress >= 15 && styles.conversionStepTextActive]}>
                    Validating tokens
                  </ThemedText>
                </View>
                <View style={[styles.conversionStep, conversionProgress >= 35 && styles.conversionStepActive]}>
                  <Feather name={conversionProgress >= 35 ? "check-circle" : "circle"} size={16} color={conversionProgress >= 35 ? "#4ade80" : "#666"} />
                  <ThemedText style={[styles.conversionStepText, conversionProgress >= 35 && styles.conversionStepTextActive]}>
                    Calculating exchange rate
                  </ThemedText>
                </View>
                <View style={[styles.conversionStep, conversionProgress >= 55 && styles.conversionStepActive]}>
                  <Feather name={conversionProgress >= 55 ? "check-circle" : "circle"} size={16} color={conversionProgress >= 55 ? "#4ade80" : "#666"} />
                  <ThemedText style={[styles.conversionStepText, conversionProgress >= 55 && styles.conversionStepTextActive]}>
                    Processing conversion
                  </ThemedText>
                </View>
                <View style={[styles.conversionStep, conversionProgress >= 75 && styles.conversionStepActive]}>
                  <Feather name={conversionProgress >= 75 ? "check-circle" : "circle"} size={16} color={conversionProgress >= 75 ? "#4ade80" : "#666"} />
                  <ThemedText style={[styles.conversionStepText, conversionProgress >= 75 && styles.conversionStepTextActive]}>
                    Transferring funds
                  </ThemedText>
                </View>
                <View style={[styles.conversionStep, conversionProgress >= 100 && styles.conversionStepActive]}>
                  <Feather name={conversionProgress >= 100 ? "check-circle" : "circle"} size={16} color={conversionProgress >= 100 ? "#4ade80" : "#666"} />
                  <ThemedText style={[styles.conversionStepText, conversionProgress >= 100 && styles.conversionStepTextActive]}>
                    Conversion complete
                  </ThemedText>
                </View>
              </View>

              {conversionProgress >= 100 ? (
                <View style={styles.conversionComplete}>
                  <Feather name="check-circle" size={32} color="#4ade80" />
                  <ThemedText style={styles.conversionCompleteText}>
                    ${convertedUSD.toLocaleString()} USD added to your account
                  </ThemedText>
                </View>
              ) : null}
            </LinearGradient>
          </View>
        </View>
      ) : null}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
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
  transformReadyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(13, 54, 18, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
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
  tokenConvertIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  tokensReadyContainer: {
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  tokensReadyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  tokensReadyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ade80",
    letterSpacing: 0.5,
  },
  tokensReadySubtext: {
    fontSize: 13,
    fontWeight: "400",
    color: "#A8C4B5",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  conversionOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing.md,
  },
  conversionOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(13, 54, 18, 0.6)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  conversionOptionText: {
    fontSize: 11,
    fontWeight: "400",
    color: "#E8D5B7",
    letterSpacing: 0.3,
  },
  conversionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  conversionModal: {
    width: "90%",
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  conversionGradient: {
    padding: Spacing.xl,
  },
  conversionHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  conversionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  conversionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#E8D5B7",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  conversionSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A8C4B5",
  },
  conversionAmounts: {
    marginBottom: Spacing.xl,
  },
  conversionFromTo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  conversionAmount: {
    alignItems: "center",
    flex: 1,
  },
  conversionLabel: {
    fontSize: 11,
    fontWeight: "400",
    color: "#A8C4B5",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  conversionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E8D5B7",
  },
  conversionValueUSD: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4ade80",
  },
  conversionProgressContainer: {
    marginBottom: Spacing.lg,
  },
  conversionProgressBar: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  conversionProgressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 4,
  },
  conversionProgressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ade80",
    textAlign: "center",
  },
  conversionSteps: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  conversionStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    opacity: 0.5,
  },
  conversionStepActive: {
    opacity: 1,
  },
  conversionStepText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#666",
  },
  conversionStepTextActive: {
    color: "#E8D5B7",
  },
  conversionComplete: {
    alignItems: "center",
    gap: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(74, 222, 128, 0.2)",
  },
  conversionCompleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ade80",
    textAlign: "center",
  },
});
