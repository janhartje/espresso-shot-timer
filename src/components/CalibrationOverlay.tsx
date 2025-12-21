import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Activity, CheckCircle, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import i18n from '../i18n';

interface CalibrationOverlayProps {
  isVisible: boolean;
  onCancel: () => void;
  timeLeft: number; // 10 to 0
  isFinished: boolean; // if true, show "Calibrated!" message
}

export const CalibrationOverlay: React.FC<CalibrationOverlayProps> = ({ 
  isVisible, 
  onCancel, 
  timeLeft, 
  isFinished 
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!isVisible && !isFinished) return null;

  return (
    <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut}
        style={[StyleSheet.absoluteFill, { zIndex: 100, justifyContent: 'center', alignItems: 'center' }]}
    >
      {/* Background Overlay */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' }]} />
      )}

      {/* Content */}
      <View className={`items-center p-8 w-full ${isLandscape ? 'max-w-3xl' : ''}`}>
        {isFinished ? (
            // Finished State
            isLandscape ? (
                <View className="flex-row items-center gap-12">
                     <CheckCircle size={100} color="#4ade80" />
                     <View className="gap-2">
                        <Text className="text-neutral-900 dark:text-white text-4xl font-bold">{i18n.t('calibrated')}</Text>
                        <Text className="text-neutral-600 dark:text-white/60 text-lg mb-8">
                            {i18n.t('calibrationSaved')}
                        </Text>
                         <TouchableOpacity 
                            onPress={onCancel}
                            className="bg-black/5 dark:bg-white/10 px-8 py-3 rounded-full self-start"
                        >
                            <Text className="text-neutral-900 dark:text-white font-medium">{i18n.t('cancel')}</Text>
                        </TouchableOpacity>
                     </View>
                </View>
            ) : (
                <View className="items-center gap-4">
                    <CheckCircle size={80} color="#4ade80" />
                    <Text className="text-neutral-900 dark:text-white text-3xl font-bold">{i18n.t('calibrated')}</Text>
                    <Text className="text-neutral-600 dark:text-white/60 text-center mb-8">
                        {i18n.t('calibrationSaved')}
                    </Text>
                     <TouchableOpacity 
                        onPress={onCancel}
                        className="bg-black/5 dark:bg-white/10 px-8 py-3 rounded-full"
                    >
                        <Text className="text-neutral-900 dark:text-white font-medium">{i18n.t('cancel')}</Text>
                    </TouchableOpacity>
                </View>
            )
        ) : (
            // Active State
            isLandscape ? (
                <View className="flex-row items-center gap-16">
                    {/* Left: Timer */}
                    <View className="items-center justify-center">
                         <View className="w-48 h-48 rounded-full border-4 border-accent-copper items-center justify-center bg-black/5 dark:bg-white/5 shadow-2xl shadow-accent-copper/20">
                            <Text className="text-8xl font-black text-neutral-900 dark:text-white tabular-nums">
                                {timeLeft}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Right: Messages & Controls */}
                    <View className="gap-6 max-w-sm">
                        <View>
                            <Text className="text-accent-copper text-sm uppercase tracking-widest font-bold mb-2">{i18n.t('calibrationMode')}</Text>
                             <Text className="text-neutral-600 dark:text-white/40 text-sm leading-relaxed">
                                {i18n.t('calibrationInstructions')}
                            </Text>
                        </View>

                        <View className="h-16 justify-center">
                             {timeLeft > 2 ? (
                                <Text key="start-msg" className="text-neutral-900 dark:text-white text-3xl font-bold text-left">{i18n.t('startMachine')}</Text>
                            ) : timeLeft > 0 ? (
                                <Text key="measuring-msg" className="text-neutral-700 dark:text-white/70 text-2xl text-left animate-pulse">{i18n.t('measuring')}</Text>
                            ) : (
                                <Activity key="activity" size={32} color={isDark ? "#D4AF37" : "#8B5A2B"} />
                            )}
                        </View>

                        <TouchableOpacity 
                            onPress={onCancel}
                            className="bg-black/5 dark:bg-white/10 px-8 py-3 rounded-full self-start"
                        >
                            <Text className="text-neutral-900 dark:text-white font-medium">{i18n.t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View className="items-center gap-6">
                    <Text className="text-accent-copper text-sm uppercase tracking-widest">{i18n.t('calibrationMode')}</Text>
                    
                    <View className="w-48 h-48 rounded-full border-4 border-accent-copper items-center justify-center bg-black/5 dark:bg-white/5">
                        <Text className="text-8xl font-black text-neutral-900 dark:text-white tabular-nums">
                            {timeLeft}
                        </Text>
                    </View>

                    <View className="h-24 justify-center">
                        {timeLeft > 2 ? (
                            <Text key="start-msg" className="text-neutral-900 dark:text-white text-xl font-bold text-center">{i18n.t('startMachine')}</Text>
                        ) : timeLeft > 0 ? (
                            <Text key="measuring-msg" className="text-neutral-700 dark:text-white/70 text-lg text-center animate-pulse">{i18n.t('measuring')}</Text>
                        ) : (
                            <Activity key="activity" size={32} color={isDark ? "#D4AF37" : "#8B5A2B"} />
                        )}
                    </View>
                    
                    <Text className="text-neutral-400 dark:text-white/30 text-xs text-center max-w-[200px]">
                        {i18n.t('calibrationInstructions')}
                    </Text>

                    <TouchableOpacity 
                        onPress={onCancel}
                        className="mt-12 bg-black/5 dark:bg-white/10 px-8 py-3 rounded-full"
                    >
                        <Text className="text-neutral-900 dark:text-white font-medium">{i18n.t('cancel')}</Text>
                    </TouchableOpacity>
                </View>
            )
        )}
      </View>
    </Animated.View>
  );
};
