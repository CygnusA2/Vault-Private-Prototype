import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  interpolateColor,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface TokenizationStage {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  status: 'pending' | 'active' | 'completed';
}

interface BlockchainData {
  transactionId?: string;
  contractAddress?: string;
  blockNumber?: number;
  blockHash?: string;
  gasUsed?: number;
  merkleRoot?: string;
  tokenSymbol?: string;
  tokenAmount?: string;
}

interface TokenizationProgressProps {
  isActive: boolean;
  assetValue: number;
  assetName: string;
  onComplete: () => void;
  onClose: () => void;
}

const TOKENIZATION_STAGES: Omit<TokenizationStage, 'status'>[] = [
  { id: 'ownership', label: 'Validating Ownership', icon: 'shield' },
  { id: 'title', label: 'Title Verification', icon: 'file-text' },
  { id: 'liens', label: 'Lien Check', icon: 'search' },
  { id: 'contract', label: 'Smart Contract', icon: 'code' },
  { id: 'deploy', label: 'Network Deploy', icon: 'upload-cloud' },
  { id: 'mint', label: 'Token Minting', icon: 'layers' },
  { id: 'consensus', label: 'Network Consensus', icon: 'check-circle' },
  { id: 'confirmed', label: 'Confirmed', icon: 'award' },
];

const generateCantonId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'CANTON_';
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  id += '_';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const generateAddress = (): string => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

const generateHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export function TokenizationProgress({
  isActive,
  assetValue,
  assetName,
  onComplete,
  onClose,
}: TokenizationProgressProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [stages, setStages] = useState<TokenizationStage[]>(
    TOKENIZATION_STAGES.map(s => ({ ...s, status: 'pending' as const }))
  );
  const [blockchainData, setBlockchainData] = useState<BlockchainData>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(0);

  const progressWidth = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      setCurrentStageIndex(0);
      setStages(TOKENIZATION_STAGES.map(s => ({ ...s, status: 'pending' as const })));
      setBlockchainData({
        transactionId: generateCantonId(),
        tokenSymbol: 'VLT-RE',
        tokenAmount: Math.floor(assetValue / 100).toLocaleString(),
      });
      setIsCompleted(false);
      progressWidth.value = 0;
      setSessionId(prev => prev + 1);
    } else {
      setCurrentStageIndex(-1);
      progressWidth.value = 0;
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || currentStageIndex < 0 || currentStageIndex >= TOKENIZATION_STAGES.length) {
      return;
    }

    const currentSession = sessionId;
    const targetProgress = ((currentStageIndex + 1) / TOKENIZATION_STAGES.length) * 100;
    progressWidth.value = withTiming(targetProgress, { duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1) });

    setStages(prev => prev.map((stage, idx) => ({
      ...stage,
      status: idx < currentStageIndex ? 'completed' : idx === currentStageIndex ? 'active' : 'pending'
    })));

    if (currentStageIndex === 3) {
      setBlockchainData(prev => ({
        ...prev,
        contractAddress: generateAddress(),
      }));
    }

    if (currentStageIndex === 4) {
      setBlockchainData(prev => ({
        ...prev,
        blockNumber: 18500000 + Math.floor(Math.random() * 100000),
      }));
    }

    if (currentStageIndex === 5) {
      setBlockchainData(prev => ({
        ...prev,
        gasUsed: Math.floor(150000 + Math.random() * 50000),
      }));
    }

    if (currentStageIndex === 6) {
      setBlockchainData(prev => ({
        ...prev,
        merkleRoot: generateHash(),
      }));
    }

    if (currentStageIndex === 7) {
      setBlockchainData(prev => ({
        ...prev,
        blockHash: generateHash(),
      }));
      setStages(prev => prev.map(stage => ({ ...stage, status: 'completed' as const })));
      setIsCompleted(true);
      const completeTimer = setTimeout(() => {
        if (sessionId === currentSession) {
          onComplete();
        }
      }, 1500);
      return () => clearTimeout(completeTimer);
    }

    if (currentStageIndex < TOKENIZATION_STAGES.length - 1) {
      const delays = [2500, 3000, 2800, 2200, 3500, 2500, 4000, 0];
      const timer = setTimeout(() => {
        if (sessionId === currentSession) {
          setCurrentStageIndex(prev => prev + 1);
        }
      }, delays[currentStageIndex]);
      return () => clearTimeout(timer);
    }
  }, [currentStageIndex, sessionId, isActive]);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!isActive) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={styles.overlay}
    >
      <Animated.View style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.cantonLogo}>
              <Feather name="hexagon" size={24} color="#4ade80" />
            </View>
            <View>
              <ThemedText style={styles.headerTitle}>Canton Network</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Tokenization in Progress</ThemedText>
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={20} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>

        <View style={styles.assetInfo}>
          <ThemedText style={styles.assetLabel}>Asset</ThemedText>
          <ThemedText style={styles.assetName}>{assetName}</ThemedText>
          <ThemedText style={styles.assetValue}>
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(assetValue)}
          </ThemedText>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, progressBarStyle]}>
              <Animated.View style={[styles.progressGlow, glowStyle]} />
            </Animated.View>
          </View>
          <ThemedText style={styles.progressText}>
            {isCompleted ? '100%' : `${Math.round(((currentStageIndex + 1) / TOKENIZATION_STAGES.length) * 100)}%`}
          </ThemedText>
        </View>

        <View style={styles.stagesContainer}>
          {stages.map((stage, index) => (
            <Animated.View
              key={stage.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={styles.stageRow}
            >
              <View style={[
                styles.stageIcon,
                stage.status === 'completed' && styles.stageIconCompleted,
                stage.status === 'active' && styles.stageIconActive,
              ]}>
                {stage.status === 'completed' ? (
                  <Feather name="check" size={12} color="#0d3612" />
                ) : stage.status === 'active' ? (
                  <Animated.View style={styles.activeIndicator}>
                    <Feather name={stage.icon} size={12} color="#0d3612" />
                  </Animated.View>
                ) : (
                  <Feather name={stage.icon} size={12} color="rgba(255,255,255,0.3)" />
                )}
              </View>
              <ThemedText style={[
                styles.stageLabel,
                stage.status === 'completed' && styles.stageLabelCompleted,
                stage.status === 'active' && styles.stageLabelActive,
              ]}>
                {stage.label}
              </ThemedText>
              {stage.status === 'active' ? (
                <View style={styles.loadingDots}>
                  <LoadingDots />
                </View>
              ) : null}
            </Animated.View>
          ))}
        </View>

        <View style={styles.blockchainDataContainer}>
          <ThemedText style={styles.blockchainTitle}>Blockchain Data</ThemedText>
          
          {blockchainData.transactionId ? (
            <Animated.View entering={SlideInRight.duration(300)} style={styles.dataRow}>
              <ThemedText style={styles.dataLabel}>Transaction ID</ThemedText>
              <ThemedText style={styles.dataValue} numberOfLines={1}>
                {blockchainData.transactionId}
              </ThemedText>
            </Animated.View>
          ) : null}
          
          {blockchainData.contractAddress ? (
            <Animated.View entering={SlideInRight.duration(300)} style={styles.dataRow}>
              <ThemedText style={styles.dataLabel}>Contract</ThemedText>
              <ThemedText style={styles.dataValue} numberOfLines={1}>
                {blockchainData.contractAddress.slice(0, 10)}...{blockchainData.contractAddress.slice(-8)}
              </ThemedText>
            </Animated.View>
          ) : null}
          
          {blockchainData.blockNumber ? (
            <Animated.View entering={SlideInRight.duration(300)} style={styles.dataRow}>
              <ThemedText style={styles.dataLabel}>Block</ThemedText>
              <ThemedText style={styles.dataValue}>
                #{blockchainData.blockNumber.toLocaleString()}
              </ThemedText>
            </Animated.View>
          ) : null}
          
          {blockchainData.gasUsed ? (
            <Animated.View entering={SlideInRight.duration(300)} style={styles.dataRow}>
              <ThemedText style={styles.dataLabel}>Gas Used</ThemedText>
              <ThemedText style={styles.dataValue}>
                {blockchainData.gasUsed.toLocaleString()} gwei
              </ThemedText>
            </Animated.View>
          ) : null}
          
          {blockchainData.tokenSymbol ? (
            <Animated.View entering={SlideInRight.duration(300)} style={styles.dataRow}>
              <ThemedText style={styles.dataLabel}>Tokens</ThemedText>
              <ThemedText style={styles.dataValueHighlight}>
                {blockchainData.tokenAmount} {blockchainData.tokenSymbol}
              </ThemedText>
            </Animated.View>
          ) : null}
          
          {blockchainData.blockHash && isCompleted ? (
            <Animated.View entering={FadeInUp.duration(500)} style={styles.successBanner}>
              <Feather name="check-circle" size={20} color="#4ade80" />
              <ThemedText style={styles.successText}>Tokenization Complete</ThemedText>
            </Animated.View>
          ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function LoadingDots() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      ),
      -1
    );
    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1
      )
    );
    dot3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    zIndex: 1000,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(13, 54, 18, 0.95)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    padding: Spacing.xl,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cantonLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ade80',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(168, 196, 181, 0.15)',
  },
  assetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(168, 196, 181, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E8D5B7',
    marginBottom: 4,
  },
  assetValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4ade80',
    fontFamily: 'monospace',
  },
  progressContainer: {
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 3,
    position: 'relative',
  },
  progressGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
    minWidth: 45,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  stagesContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  stageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  stageIconCompleted: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  stageIconActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  activeIndicator: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageLabel: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  stageLabelCompleted: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stageLabelActive: {
    color: '#4ade80',
    fontWeight: '500',
  },
  loadingDots: {
    width: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4ade80',
  },
  blockchainDataContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 196, 181, 0.15)',
  },
  blockchainTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(168, 196, 181, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 196, 181, 0.1)',
  },
  dataLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dataValue: {
    fontSize: 11,
    color: '#E8D5B7',
    fontFamily: 'monospace',
    maxWidth: '60%',
  },
  dataValueHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4ade80',
    fontFamily: 'monospace',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
  },
});
