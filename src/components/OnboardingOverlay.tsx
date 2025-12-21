import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { storage } from '../utils/storage';
import Animated, { FadeIn, FadeOut, FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { ChevronRight, Check, Coffee, Smartphone, Activity } from 'lucide-react-native';
import i18n from '../i18n';

interface OnboardingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    key: 'step1',
    Icon: Coffee,
  },
  {
    key: 'step2',
    Icon: Smartphone, 
  },
  {
    key: 'step3',
    Icon: Activity,
  },
];

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ isVisible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await storage.setHasSeenOnboarding(true);
      onComplete();
    } catch (e) {
      console.error('Failed to save onboarding status', e);
      onComplete();
    }
  };

  const stepData = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const IconComponent = stepData.Icon;

  return (
    <Animated.View 
        entering={FadeIn.duration(300)} 
        exiting={FadeOut.duration(300)}
        style={[StyleSheet.absoluteFill, { zIndex: 999, justifyContent: 'center', alignItems: 'center' }]}
    >
      {/* Background with Blur */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={95} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.96)' : 'rgba(255,255,255,0.96)' }]} />
      )}

      {/* Content Container */}
      <View className={`${isLandscape ? 'w-full max-w-2xl px-8 flex-row items-center gap-12' : 'w-full max-w-sm px-8'}`}>
        
        {isLandscape ? (
            // Landscape Layout
            <>
                {/* Left Panel: Visuals */}
                <View className="flex-1 items-center justify-center">
                    <Animated.View 
                        key={`icon-${currentStep}`}
                        entering={FadeInRight.springify().damping(20).mass(0.8).delay(100)}
                        exiting={FadeOutLeft.springify().damping(20).mass(0.8)}
                        layout={Layout.springify()}
                    >
                        <View className="w-40 h-40 rounded-[40px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 items-center justify-center shadow-2xl shadow-black mb-8">
                            <IconComponent size={80} color={isDark ? "#E6B778" : "#8B5A2B"} strokeWidth={1.5} />
                        </View>
                    </Animated.View>

                    {/* Progress Indicator (Moved to left panel in Landscape) */}
                    <View className="flex-row gap-2">
                        {STEPS.map((_, index) => (
                            <View 
                                key={index} 
                                className={`h-1.5 rounded-full transition-all ${index === currentStep ? 'w-8 bg-accent-copper' : 'w-2 bg-black/20 dark:bg-white/20'}`} 
                            />
                        ))}
                    </View>
                </View>

                {/* Right Panel: Content & Controls */}
                <View className="flex-[1.5] items-start justify-center">
                     <Animated.View 
                        key={`text-${currentStep}`}
                        entering={FadeInRight.springify().damping(20).mass(0.8).delay(200)}
                        exiting={FadeOutLeft.springify().damping(20).mass(0.8)}
                        className="gap-4 w-full"
                    >
                        <View className="gap-2">
                            <Text className="text-neutral-900 dark:text-white text-4xl font-bold tracking-tight text-left">
                                {i18n.t(`onboarding.${stepData.key}.title`)}
                            </Text>
                            <Text className="text-neutral-600 dark:text-zinc-400 text-lg text-left leading-relaxed">
                                {i18n.t(`onboarding.${stepData.key}.description`)}
                            </Text>
                        </View>

                        <View className="flex-row items-center gap-4 mt-8">
                            <TouchableOpacity 
                                onPress={handleNext}
                                className="bg-accent-copper h-14 px-8 rounded-full flex-row items-center justify-center gap-2 active:opacity-90 shadow-lg shadow-accent-copper/20"
                            >
                                <Text className="text-black font-bold text-lg tracking-wide uppercase">
                                    {isLastStep ? i18n.t('onboarding.start') : i18n.t('onboarding.next')}
                                </Text>
                                {isLastStep ? <Check size={20} color="black" strokeWidth={3} /> : <ChevronRight size={20} color="black" strokeWidth={3} />}
                            </TouchableOpacity>

                            {!isLastStep && (
                                <TouchableOpacity 
                                    onPress={finishOnboarding}
                                    className="h-14 px-4 items-center justify-center"
                                >
                                    <Text className="text-neutral-400 dark:text-white/40 font-medium text-sm">
                                        {i18n.t('onboarding.skip')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </View>
            </>
        ) : (
            // Portrait Layout (Original)
            <>
                {/* Progress Indicator */}
                <View className="flex-row gap-2 mb-12 justify-center">
                    {STEPS.map((_, index) => (
                        <View 
                            key={index} 
                            className={`h-1 rounded-full transition-all ${index === currentStep ? 'w-8 bg-accent-copper' : 'w-2 bg-black/20 dark:bg-white/20'}`} 
                        />
                    ))}
                </View>

                <Animated.View 
                    key={currentStep}
                    entering={FadeInRight.springify().damping(20).mass(0.8)}
                    exiting={FadeOutLeft.springify().damping(20).mass(0.8)}
                    layout={Layout.springify()}
                    className="items-center gap-6"
                >
                    {/* Icon Circle */}
                    <View className="w-32 h-32 rounded-[32px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 items-center justify-center mb-4 shadow-2xl shadow-black">
                        <IconComponent size={64} color={isDark ? "#E6B778" : "#8B5A2B"} strokeWidth={1.5} />
                    </View>

                    {/* Title & Description */}
                    <View className="items-center gap-3">
                        <Text className="text-neutral-900 dark:text-white text-3xl font-bold text-center tracking-tight">
                            {i18n.t(`onboarding.${stepData.key}.title`)}
                        </Text>
                        <Text className="text-neutral-600 dark:text-zinc-400 text-lg text-center leading-relaxed">
                            {i18n.t(`onboarding.${stepData.key}.description`)}
                        </Text>
                    </View>
                </Animated.View>

                {/* Buttons */}
                <View className="mt-16 gap-4">
                    <TouchableOpacity 
                        onPress={handleNext}
                        className="bg-accent-copper h-14 rounded-full flex-row items-center justify-center gap-2 active:opacity-90 shadow-lg shadow-accent-copper/20"
                    >
                        <Text className="text-black font-bold text-lg tracking-wide uppercase">
                            {isLastStep ? i18n.t('onboarding.start') : i18n.t('onboarding.next')}
                        </Text>
                        {isLastStep ? <Check size={20} color="black" strokeWidth={3} /> : <ChevronRight size={20} color="black" strokeWidth={3} />}
                    </TouchableOpacity>

                    {!isLastStep && (
                        <TouchableOpacity 
                            onPress={finishOnboarding}
                            className="h-10 items-center justify-center"
                        >
                            <Text className="text-neutral-400 dark:text-white/40 font-medium text-sm p-2">
                                {i18n.t('onboarding.skip')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </>
        )}

      </View>
    </Animated.View>
  );
};
