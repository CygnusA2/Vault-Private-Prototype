import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

type IntroScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Intro">;
};

const INTRO_TEXT = `Instant liquidity for the most discerning Ultra-High Net Worth clientele where timing matters without wealth erosion or security compromise.

The formula to preserve wealth across generations so dynasties endure.`;

export default function IntroScreen({ navigation }: IntroScreenProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const charIndexRef = useRef(0);
  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withTiming(0, { duration: 530 }),
      -1,
      true
    );
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  useEffect(() => {
    const typeNextChar = () => {
      if (charIndexRef.current < INTRO_TEXT.length) {
        const nextChar = INTRO_TEXT[charIndexRef.current];
        setDisplayedText(INTRO_TEXT.substring(0, charIndexRef.current + 1));
        charIndexRef.current++;

        let delay = 120 + Math.random() * 80;
        
        if (nextChar === "." || nextChar === ",") {
          delay = 800 + Math.random() * 600;
        } else if (nextChar === "\n") {
          delay = 1200 + Math.random() * 500;
        } else if (Math.random() < 0.12) {
          delay = 500 + Math.random() * 400;
        } else if (Math.random() < 0.05) {
          delay = 800 + Math.random() * 400;
        }

        setTimeout(typeNextChar, delay);
      } else {
        setTimeout(() => {
          setIsComplete(true);
          setShowCursor(false);
        }, 1500);
      }
    };

    const initialDelay = setTimeout(typeNextChar, 1500);
    return () => clearTimeout(initialDelay);
  }, []);

  const handleContinue = () => {
    navigation.replace("Welcome");
  };

  useEffect(() => {
    if (isComplete) {
      const autoAdvance = setTimeout(() => {
        navigation.replace("Welcome");
      }, 3000);
      return () => clearTimeout(autoAdvance);
    }
  }, [isComplete, navigation]);

  return (
    <LinearGradient
      colors={["#0a0a0a", "#1a1a1a", "#0a0a0a"]}
      style={styles.container}
    >
      <Pressable style={styles.touchArea} onPress={handleContinue}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <ThemedText style={styles.introText}>
              {displayedText}
              {showCursor ? (
                <Animated.Text style={[styles.cursor, cursorStyle]}>|</Animated.Text>
              ) : null}
            </ThemedText>
          </View>

          {isComplete ? (
            <Animated.View 
              entering={FadeIn.duration(600)} 
              style={styles.continueHint}
            >
              <ThemedText style={styles.hintText}>
                Tap to continue
              </ThemedText>
            </Animated.View>
          ) : null}
        </View>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  textContainer: {
    maxWidth: 340,
  },
  introText: {
    fontSize: 22,
    lineHeight: 38,
    color: Colors.dark.primary,
    fontWeight: "400",
    letterSpacing: 0.5,
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "Baskerville",
      android: "serif",
      default: "Georgia, Times New Roman, serif",
    }),
  },
  cursor: {
    color: Colors.dark.primary,
    fontWeight: "300",
    fontFamily: Platform.select({
      ios: "Baskerville",
      android: "serif", 
      default: "Georgia, Times New Roman, serif",
    }),
  },
  continueHint: {
    position: "absolute",
    bottom: 80,
  },
  hintText: {
    fontSize: 14,
    color: Colors.dark.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
