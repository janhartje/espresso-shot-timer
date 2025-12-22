import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, useWindowDimensions, useColorScheme, Switch } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Minus, Plus, Zap, Ban, Hourglass } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { storage } from '../utils/storage';

interface SettingsOverlayProps {
    isVisible: boolean;
    onClose: () => void;
    sensitivity: number;
    onSensitivityChange: (value: number) => void;
    hysteresis: number;
    onHysteresisChange: (value: number) => void;
    preInfusionDelay: number;
    onPreInfusionDelayChange: (value: number) => void;
    debugMode: boolean;
    onToggleDebug: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ 
    isVisible, 
    onClose,
    sensitivity,
    onSensitivityChange,
    hysteresis,
    onHysteresisChange,
    preInfusionDelay,
    onPreInfusionDelayChange,
    debugMode,
    onToggleDebug
}) => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const currentLevel = typeof sensitivity === 'number' ? sensitivity : 10;
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // Generic handler for continuous adjustment
    const handlePressIn = (
        action: 'sensitivity' | 'hysteresis' | 'preInfusion', 
        direction: 'up' | 'down'
    ) => {
        // Define step sizes and limits
        const config = {
            sensitivity: { step: 1, min: 1, max: 20 },
            hysteresis: { step: 5, min: 50, max: 95 },
            preInfusion: { step: 500, min: 0, max: 15000 }
        };
        
        const { step, min, max } = config[action];
        const delta = direction === 'up' ? step : -step;

        const update = () => {
             // We need fresh values here, but since this is a closure over state that might be stale in setInterval,
             // we rely on the functional state updates passed to the parent or refs if we had them.
             // BUT: The parent props (onChange) update the parent state, which causes a re-render here.
             // However, setInterval closure captures the initial props.
             // WE MUST USE REFS for current values to make this work inside setInterval without clearing/recreating it constantly.
        };
        
        // Actually, a simpler way for this component structure:
        // Trigger one change immediately
        // formatting logic is specific to render, update logic is specific here.
        
        // To avoid stale closures in setInterval, we'll use a Ref to track "current action" and execute it in a loop
        // OR just simple recursion with setTimeout which might be safer with React state.
        
        // Let's go with the Ref approach for values as we did for 'currentLevel' before.
    };

    // Correct Approach: Use Refs to hold current values for the interval
    const valuesRef = React.useRef({ sensitivity, hysteresis, preInfusionDelay });
    useEffect(() => {
        valuesRef.current = { sensitivity, hysteresis, preInfusionDelay };
    }, [sensitivity, hysteresis, preInfusionDelay]);

    if (!isVisible) return null;

    const startAdjusting = (field: 'sensitivity' | 'hysteresis' | 'preInfusion', delta: number) => {
        const adjust = () => {
            const current = valuesRef.current;
            if (field === 'sensitivity') {
                const next = Math.max(1, Math.min(20, (typeof current.sensitivity === 'number' ? current.sensitivity : 10) + delta));
                onSensitivityChange(next);
            } else if (field === 'hysteresis') {
                const next = Math.max(50, Math.min(95, current.hysteresis + (delta * 5))); // Delta is +/- 1, step is 5
                onHysteresisChange(next);
            } else if (field === 'preInfusion') {
                 const next = Math.max(0, Math.min(15000, current.preInfusionDelay + (delta * 500))); // Delta is +/- 1, step is 500
                 onPreInfusionDelayChange(next);
            }
        };

        adjust(); // Immediate
        intervalRef.current = setInterval(adjust, 150);
    };

    const stopAdjusting = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };


    return (
        <Animated.View 
            entering={FadeIn.duration(300)} 
            exiting={FadeOut.duration(300)}
            style={[StyleSheet.absoluteFill, { zIndex: 999, justifyContent: 'center', alignItems: 'center' }]}
        >
             {Platform.OS === 'ios' ? (
                <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' }]} />
            )}

            <View 
                className={`w-full ${isLandscape ? 'max-w-4xl' : 'max-w-md'}`}
                style={{ 
                    maxHeight: '85%',
                    paddingHorizontal: 20,
                }}
            >
                <View className="bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-black">
                     {/* Header */}
                     <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                        <Text className="text-neutral-900 dark:text-white text-2xl font-bold tracking-tight">
                            {i18n.t('settings')}
                        </Text>
                        <TouchableOpacity 
                            onPress={onClose}
                            className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 active:bg-black/10 dark:active:bg-white/20"
                        >
                            <X size={20} color={isDark ? "#FFF" : "#000"} opacity={0.8} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 24 }}>
                        <View className={isLandscape ? "flex-row gap-4" : "flex-col"}>
                            {/* Sensitivity Control */}
                            <View className={`bg-white dark:bg-white/5 p-4 rounded-2xl mb-4 ${isLandscape ? "flex-1 mb-0" : ""}`}>
                                <View className="flex-row items-center gap-3 mb-2">
                                    <Zap size={24} color={isDark ? "#E6B778" : "#8B5A2B"} />
                                    <View>
                                        <Text className="text-neutral-900 dark:text-white font-bold text-lg">
                                            {i18n.t('settings_sensitivity_title')}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mt-4 bg-black/5 dark:bg-black/20 rounded-full p-2">
                                    <TouchableOpacity 
                                        onPressIn={() => startAdjusting('sensitivity', -1)}
                                        onPressOut={stopAdjusting}
                                        className="w-12 h-12 bg-white dark:bg-white/10 rounded-full items-center justify-center shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Minus size={20} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                    
                                    <View className="items-center">
                                        <Text className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
                                            {currentLevel}
                                        </Text>
                                        <Text className="text-[10px] text-neutral-400 dark:text-white/30 font-medium uppercase tracking-widest -mt-1">
                                            Level
                                        </Text>
                                    </View>

                                    <TouchableOpacity 
                                        onPressIn={() => startAdjusting('sensitivity', 1)}
                                        onPressOut={stopAdjusting}
                                        className="w-12 h-12 bg-white dark:bg-white/10 rounded-full items-center justify-center shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Plus size={20} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                </View>
                                
                                <Text className="text-neutral-400 dark:text-white/40 text-xs mt-3 leading-5">
                                    {i18n.t('settings_sensitivity_desc')}
                                </Text>
                            </View>

                            {/* Hysteresis Control */}
                            <View className={`bg-white dark:bg-white/5 p-4 rounded-2xl mb-4 ${isLandscape ? "flex-1 mb-0" : ""}`}>
                                <View className="flex-row items-center gap-3 mb-2">
                                    <Ban size={24} color={isDark ? "#E6B778" : "#8B5A2B"} />
                                    <View>
                                        <Text className="text-neutral-900 dark:text-white font-bold text-lg">
                                            {i18n.t('settings_hysteresis_title')}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mt-4 bg-black/5 dark:bg-black/20 rounded-full p-2">
                                    <TouchableOpacity 
                                        onPressIn={() => startAdjusting('hysteresis', -1)}
                                        onPressOut={stopAdjusting}
                                        className="w-12 h-12 bg-white dark:bg-white/10 rounded-full items-center justify-center shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Minus size={20} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                    
                                    <View className="items-center">
                                        <Text className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
                                            {hysteresis}%
                                        </Text>
                                    </View>

                                    <TouchableOpacity 
                                        onPressIn={() => startAdjusting('hysteresis', 1)}
                                        onPressOut={stopAdjusting}
                                        className="w-12 h-12 bg-white dark:bg-white/10 rounded-full items-center justify-center shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Plus size={20} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-neutral-400 dark:text-white/40 text-xs mt-3 leading-5">
                                    {i18n.t('settings_hysteresis_desc')}
                                </Text>
                            </View>

                            {/* Pre-Infusion Control */}
                            <View className={`bg-white dark:bg-white/5 p-4 rounded-2xl mb-4 ${isLandscape ? "flex-1 mb-0" : ""}`}>
                                <View className="flex-row items-center gap-3 mb-2">
                                    <Hourglass size={24} color={isDark ? "#E6B778" : "#8B5A2B"} />
                                    <View>
                                        <Text className="text-neutral-900 dark:text-white font-bold text-lg">
                                            {i18n.t('settings_preinfusion_title')}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mt-4 bg-black/5 dark:bg-black/20 rounded-full p-2">
                                    <TouchableOpacity 
                                        onPressIn={() => startAdjusting('preInfusion', -1)}
                                        onPressOut={stopAdjusting}
                                        className="w-12 h-12 bg-white dark:bg-white/10 rounded-full items-center justify-center shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Minus size={20} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                    
                                    <View className="items-center">
                                        <Text className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
                                            {(preInfusionDelay / 1000).toFixed(1)}s
                                        </Text>
                                    </View>

                                    <TouchableOpacity 
                                        onPressIn={() => startAdjusting('preInfusion', 1)}
                                        onPressOut={stopAdjusting}
                                        className="w-12 h-12 bg-white dark:bg-white/10 rounded-full items-center justify-center shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Plus size={20} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-neutral-400 dark:text-white/40 text-xs mt-3 leading-5">
                                    {i18n.t('settings_preinfusion_desc')}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Animated.View>
    );
};
