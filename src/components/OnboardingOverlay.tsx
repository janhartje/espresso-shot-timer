import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { storage } from '../utils/storage';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft, Layout } from 'react-native-reanimated';
import { ChevronRight, Check, Coffee, Smartphone, Activity } from 'lucide-react-native';
import { Platform } from 'react-native';
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
        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.96)' }]} />
      )}

      {/* Content Container */}
      <View className="w-full max-w-sm px-8">
        
        {/* Progress Indicator */}
        <View className="flex-row gap-2 mb-12 justify-center">
            {STEPS.map((_, index) => (
                <View 
                    key={index} 
                    className={`h-1 rounded-full transition-all ${index === currentStep ? 'w-8 bg-accent-copper' : 'w-2 bg-white/20'}`} 
                />
            ))}
        </View>

        <Animated.View 
            key={currentStep}
            entering={SlideInRight.springify().damping(20).mass(0.8)}
            exiting={SlideOutLeft.springify().damping(20).mass(0.8)}
            layout={Layout.springify()}
            className="items-center gap-6"
        >
            {/* Icon Circle */}
            <View className="w-32 h-32 rounded-[32px] bg-white/5 border border-white/10 items-center justify-center mb-4 shadow-2xl shadow-black">
                <IconComponent size={64} color="#E6B778" strokeWidth={1.5} />
            </View>

            {/* Title & Description */}
            <View className="items-center gap-3">
                <Text className="text-white text-3xl font-bold text-center tracking-tight">
                    {i18n.t(`onboarding.${stepData.key}.title`)}
                </Text>
                <Text className="text-zinc-400 text-lg text-center leading-relaxed">
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
                    <Text className="text-white/40 font-medium text-sm p-2">
                        {i18n.t('onboarding.skip')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>

      </View>
    </Animated.View>
  );
};
