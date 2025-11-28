import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { useAuth } from "@/context/AuthContext";

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { simulateReturningUser } = useAuth();
  const primaryScale = useSharedValue(1);
  const secondaryScale = useSharedValue(1);

  const primaryAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryScale.value }],
  }));

  const secondaryAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryScale.value }],
  }));

  const handleGetStarted = () => {
    navigation.navigate("PhoneEntry");
  };

  const handleSignIn = () => {
    simulateReturningUser();
    navigation.navigate("FaceRecognition");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0E14", "#1A1F2E", "#0A0E14"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <Animated.View
          entering={FadeIn.duration(800).delay(200)}
          style={styles.logoContainer}
        >
          <View style={styles.logoGlow}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText type="display" style={styles.title}>
            Vault Private
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: Colors.dark.textSecondary }]}
          >
            Exclusive banking for distinguished clients
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(800).delay(600)}
          style={styles.buttonContainer}
        >
          <AnimatedPressable
            onPress={handleGetStarted}
            onPressIn={() => {
              primaryScale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              primaryScale.value = withSpring(1);
            }}
            style={[styles.primaryButton, primaryAnimatedStyle]}
          >
            <ThemedText
              type="h4"
              style={[styles.buttonText, { color: Colors.dark.buttonText }]}
            >
              Get Started
            </ThemedText>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleSignIn}
            onPressIn={() => {
              secondaryScale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              secondaryScale.value = withSpring(1);
            }}
            style={[styles.secondaryButton, secondaryAnimatedStyle]}
          >
            <ThemedText type="h4" style={styles.secondaryButtonText}>
              Sign In
            </ThemedText>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoGlow: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    color: Colors.dark.text,
  },
  subtitle: {
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.lg,
  },
  primaryButton: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  secondaryButton: {
    height: Spacing.buttonHeight,
    backgroundColor: "transparent",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.dark.text,
  },
});
