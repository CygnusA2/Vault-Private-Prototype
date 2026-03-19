import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
  const charIndexRef = useRef(0);

  useEffect(() => {
    const typeNextChar = () => {
      if (charIndexRef.current < INTRO_TEXT.length) {
        const nextChar = INTRO_TEXT[charIndexRef.current];
        setDisplayedText(INTRO_TEXT.substring(0, charIndexRef.current + 1));
        charIndexRef.current++;

        let delay = 30 + Math.random() * 20;
        
        if (nextChar === "." || nextChar === ",") {
          delay = 200 + Math.random() * 100;
        } else if (nextChar === "\n") {
          delay = 300 + Math.random() * 150;
        } else if (Math.random() < 0.10) {
          delay = 100 + Math.random() * 80;
        } else if (Math.random() < 0.04) {
          delay = 180 + Math.random() * 80;
        }

        setTimeout(typeNextChar, delay);
      } else {
        setIsComplete(true);
      }
    };

    const initialDelay = setTimeout(typeNextChar, 500);
    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (isComplete) {
      const autoAdvance = setTimeout(() => {
        navigation.replace("Welcome");
      }, 2500);
      return () => clearTimeout(autoAdvance);
    }
  }, [isComplete, navigation]);

  return (
    <LinearGradient
      colors={["#0a0a0a", "#1a1a1a", "#0a0a0a"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.introText}>
            {displayedText}
          </ThemedText>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
