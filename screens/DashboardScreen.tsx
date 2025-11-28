import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const QUICK_ACTIONS = [
  { id: "transfer", icon: "send" as const, label: "Transfer" },
  { id: "pay", icon: "credit-card" as const, label: "Pay" },
  { id: "invest", icon: "trending-up" as const, label: "Invest" },
  { id: "support", icon: "headphones" as const, label: "Support" },
];

const TRANSACTIONS = [
  {
    id: "1",
    name: "Private Jet Charter",
    date: "Today, 2:30 PM",
    amount: "-$45,000.00",
    type: "debit",
  },
  {
    id: "2",
    name: "Investment Return",
    date: "Yesterday",
    amount: "+$128,500.00",
    type: "credit",
  },
  {
    id: "3",
    name: "Art Gallery Purchase",
    date: "Nov 25",
    amount: "-$275,000.00",
    type: "debit",
  },
];

export default function DashboardScreen() {
  const { userData } = useAuth();

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <View>
            <ThemedText type="body" style={{ color: Colors.dark.textSecondary }}>
              Welcome back,
            </ThemedText>
            <ThemedText type="h2" style={styles.welcomeName}>
              {userData?.firstName || "Distinguished Client"}
            </ThemedText>
          </View>
          <View style={styles.avatarContainer}>
            <ThemedText type="h3" style={{ color: Colors.dark.primary }}>
              {userData?.firstName?.[0] || "V"}
              {userData?.lastName?.[0] || "P"}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.balanceCard}>
        <ThemedText type="label" style={styles.balanceLabel}>
          TOTAL BALANCE
        </ThemedText>
        <ThemedText type="financial" style={styles.balanceAmount}>
          $12,847,235.00
        </ThemedText>
        <View style={styles.balanceChange}>
          <Feather name="trending-up" size={16} color={Colors.dark.success} />
          <ThemedText type="small" style={{ color: Colors.dark.success }}>
            +2.4% this month
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton key={action.id} {...action} />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(400)}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Recent Transactions
          </ThemedText>
          <Pressable>
            <ThemedText type="body" style={{ color: Colors.dark.primary }}>
              See All
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.transactionsList}>
          {TRANSACTIONS.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Feather
                  name={transaction.type === "credit" ? "arrow-down-left" : "arrow-up-right"}
                  size={20}
                  color={
                    transaction.type === "credit"
                      ? Colors.dark.success
                      : Colors.dark.textSecondary
                  }
                />
              </View>
              <View style={styles.transactionInfo}>
                <ThemedText type="body" style={styles.transactionName}>
                  {transaction.name}
                </ThemedText>
                <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
                  {transaction.date}
                </ThemedText>
              </View>
              <ThemedText
                type="h4"
                style={[
                  styles.transactionAmount,
                  transaction.type === "credit" && styles.transactionAmountCredit,
                ]}
              >
                {transaction.amount}
              </ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScreenScrollView>
  );
}

function QuickActionButton({
  icon,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
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
      style={[styles.quickActionButton, animatedStyle]}
    >
      <View style={styles.quickActionIcon}>
        <Feather name={icon} size={24} color={Colors.dark.primary} />
      </View>
      <ThemedText type="small" style={styles.quickActionLabel}>
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.xl,
  },
  welcomeCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeName: {
    color: Colors.dark.text,
    marginTop: Spacing.xs,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  balanceLabel: {
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    color: Colors.dark.text,
    textAlign: "center",
  },
  transactionsList: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  transactionAmount: {
    color: Colors.dark.text,
  },
  transactionAmountCredit: {
    color: Colors.dark.success,
  },
});
