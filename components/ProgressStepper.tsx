import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressStepper({ currentStep, totalSteps }: ProgressStepperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.step,
              index + 1 <= currentStep && styles.stepCompleted,
              index + 1 === currentStep && styles.stepActive,
            ]}
          />
        ))}
      </View>
      <ThemedText type="small" style={styles.text}>
        Step {currentStep} of {totalSteps}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing["2xl"],
  },
  stepsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  stepCompleted: {
    backgroundColor: Colors.dark.primary,
  },
  stepActive: {
    backgroundColor: Colors.dark.primary,
  },
  text: {
    color: Colors.dark.textSecondary,
  },
});
