import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur'; // Or View fallback if Android issues persist
import { Activity, CheckCircle, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Since we had issues with BlurView on Android, we'll use a conditional approach or just a dark overlay.
// For now, let's stick to the safe "dark overlay" style we used in GlassCard for Android, 
// but we can try expo-blur on iOS for that nice effect.
import { Platform } from 'react-native';

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
  if (!isVisible && !isFinished) return null;

  return (
    <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut}
        style={[StyleSheet.absoluteFill, { zIndex: 100, justifyContent: 'center', alignItems: 'center' }]}
    >
      {/* Background Overlay */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)' }]} />
      )}

      {/* Content */}
      <View className="items-center p-8 w-full">
        {isFinished ? (
            <View className="items-center gap-4">
                <CheckCircle size={80} color="#4ade80" />
                <Text className="text-white text-3xl font-bold">Calibrated!</Text>
                <Text className="text-white/60 text-center mb-8">
                    Your machine's vibration profile has been saved.
                </Text>
            </View>
        ) : (
            <View className="items-center gap-6">
                <Text className="text-accent-copper text-sm uppercase tracking-widest">Calibration Mode</Text>
                
                <View className="w-48 h-48 rounded-full border-4 border-accent-copper items-center justify-center bg-white/5">
                    <Text className="text-8xl font-black text-white tabular-nums">
                        {timeLeft}
                    </Text>
                </View>

                <View className="h-24 justify-center">
                    {timeLeft > 2 ? (
                        <Text key="start-msg" className="text-white text-xl font-bold text-center">Start your machine!</Text>
                    ) : timeLeft > 0 ? (
                        <Text key="measuring-msg" className="text-white/70 text-lg text-center animate-pulse">Measuring...</Text>
                    ) : (
                        <Activity key="activity" size={32} color="#D4AF37" />
                    )}
                </View>
                
                <Text className="text-white/30 text-xs text-center max-w-[200px]">
                    Place cup on scale/tray as usual. Keep phone steady.
                </Text>
            </View>
        )}

        {/* Cancel Button */}
        {!isFinished && (
            <TouchableOpacity 
                onPress={onCancel}
                className="mt-12 bg-white/10 px-8 py-3 rounded-full"
            >
                <Text className="text-white font-medium">Cancel</Text>
            </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};
