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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ACCOUNTS = [
  {
    id: "1",
    name: "Private Checking",
    type: "checking",
    balance: "$2,847,235.00",
    accountNumber: "****4521",
    icon: "credit-card" as const,
  },
  {
    id: "2",
    name: "Investment Portfolio",
    type: "investment",
    balance: "$8,500,000.00",
    accountNumber: "****7892",
    icon: "trending-up" as const,
  },
  {
    id: "3",
    name: "Private Savings",
    type: "savings",
    balance: "$1,500,000.00",
    accountNumber: "****3341",
    icon: "lock" as const,
  },
];

export default function AccountsScreen() {
  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(600).delay(100)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          YOUR ACCOUNTS
        </ThemedText>
      </Animated.View>

      {ACCOUNTS.map((account, index) => (
        <AccountCard key={account.id} account={account} delay={150 + index * 100} />
      ))}

      <Animated.View entering={FadeInDown.duration(600).delay(450)} style={styles.addAccountContainer}>
        <Pressable style={styles.addAccountButton}>
          <Feather name="plus" size={24} color={Colors.dark.primary} />
          <ThemedText type="body" style={{ color: Colors.dark.primary }}>
            Add New Account
          </ThemedText>
        </Pressable>
      </Animated.View>
    </ScreenScrollView>
  );
}

function AccountCard({
  account,
  delay,
}: {
  account: (typeof ACCOUNTS)[0];
  delay: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(delay)}>
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[styles.accountCard, animatedStyle]}
      >
        <View style={styles.accountHeader}>
          <View style={styles.accountIconContainer}>
            <Feather name={account.icon} size={24} color={Colors.dark.primary} />
          </View>
          <View style={styles.accountInfo}>
            <ThemedText type="h4" style={styles.accountName}>
              {account.name}
            </ThemedText>
            <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
              {account.accountNumber}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={Colors.dark.textTertiary} />
        </View>
        <View style={styles.accountBalanceContainer}>
          <ThemedText type="label" style={styles.balanceLabel}>
            AVAILABLE BALANCE
          </ThemedText>
          <ThemedText type="h2" style={styles.accountBalance}>
            {account.balance}
          </ThemedText>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.lg,
  },
  sectionLabel: {
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  accountCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  accountBalanceContainer: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  balanceLabel: {
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  accountBalance: {
    color: Colors.dark.text,
  },
  addAccountContainer: {
    marginTop: Spacing.lg,
  },
  addAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: "dashed",
  },
});
