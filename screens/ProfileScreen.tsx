import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const VERIFICATION_BADGES = [
  { id: "phone", label: "Phone Verified", icon: "phone" as const, verified: true },
  { id: "id", label: "ID Verified", icon: "file-text" as const, verified: true },
  { id: "biometric", label: "Biometrics", icon: "smartphone" as const, verified: true },
];

export default function ProfileScreen() {
  const { userData } = useAuth();

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <ThemedText type="h1" style={{ color: Colors.dark.primary }}>
            {userData?.firstName?.[0] || "V"}
            {userData?.lastName?.[0] || "P"}
          </ThemedText>
        </View>
        <ThemedText type="h2" style={styles.profileName}>
          {userData?.firstName} {userData?.lastName}
        </ThemedText>
        <ThemedText type="body" style={{ color: Colors.dark.textSecondary }}>
          Account: VP-{Math.floor(Math.random() * 900000 + 100000)}
        </ThemedText>
        <Pressable style={styles.editButton}>
          <Feather name="edit-2" size={16} color={Colors.dark.primary} />
          <ThemedText type="body" style={{ color: Colors.dark.primary }}>
            Edit Profile
          </ThemedText>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          VERIFICATION STATUS
        </ThemedText>
        <View style={styles.badgesContainer}>
          {VERIFICATION_BADGES.map((badge) => (
            <View key={badge.id} style={styles.badge}>
              <View
                style={[
                  styles.badgeIcon,
                  badge.verified && styles.badgeIconVerified,
                ]}
              >
                <Feather
                  name={badge.verified ? "check" : badge.icon}
                  size={16}
                  color={badge.verified ? Colors.dark.success : Colors.dark.textSecondary}
                />
              </View>
              <ThemedText type="small" style={styles.badgeLabel}>
                {badge.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(300)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          PERSONAL INFORMATION
        </ThemedText>
        <View style={styles.infoCard}>
          <InfoRow label="Email" value={userData?.email || "Not provided"} />
          <InfoRow label="Phone" value={userData?.phoneNumber || "Not provided"} />
          <InfoRow
            label="Address"
            value={
              userData?.address
                ? `${userData.address.street}, ${userData.address.city}`
                : "Not provided"
            }
          />
          <InfoRow
            label="Country"
            value={userData?.address?.country || "Not provided"}
            isLast
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(400)}>
        <ThemedText type="label" style={styles.sectionLabel}>
          ACCOUNT SUMMARY
        </ThemedText>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Feather name="credit-card" size={24} color={Colors.dark.primary} />
            <ThemedText type="h3" style={styles.summaryValue}>
              3
            </ThemedText>
            <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
              Active Accounts
            </ThemedText>
          </View>
          <View style={styles.summaryCard}>
            <Feather name="calendar" size={24} color={Colors.dark.primary} />
            <ThemedText type="h3" style={styles.summaryValue}>
              2024
            </ThemedText>
            <ThemedText type="small" style={{ color: Colors.dark.textSecondary }}>
              Member Since
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScreenScrollView>
  );
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <ThemedText type="body" style={{ color: Colors.dark.textSecondary }}>
        {label}
      </ThemedText>
      <ThemedText type="body" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing["2xl"],
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.dark.backgroundDefault,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  profileName: {
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  sectionLabel: {
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  badge: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  badgeIconVerified: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  badgeLabel: {
    color: Colors.dark.text,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  infoValue: {
    color: Colors.dark.text,
    flex: 1,
    textAlign: "right",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  summaryValue: {
    color: Colors.dark.text,
    marginVertical: Spacing.sm,
  },
});
