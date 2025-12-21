import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Settings } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

interface CalibrationCardProps {
  onPress: () => void;
  isCalibrating?: boolean; // New prop
  className?: string; 
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CalibrationCard: React.FC<CalibrationCardProps> = ({ onPress, isCalibrating, className }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
      // "Drückt sich ein" effect
      scale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1, { damping: 10 })
      );
      onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
      return {
          transform: [{ scale: scale.value }]
      };
  });

  return (
    <AnimatedTouchable onPress={handlePress} className={className} activeOpacity={0.9} style={animatedStyle} disabled={isCalibrating}>
        <View className="items-center justify-center flex-1">
            <View className="items-center justify-center gap-2">
                {isCalibrating ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Settings size={22} color="#a1a1aa" /> 
                )}
                
                <Text className={`text-sm font-medium ${isCalibrating ? 'text-white' : 'text-zinc-500'}`}>
                    {isCalibrating ? 'Calibrating...' : 'Calibrate'}
                </Text>
            </View>
        </View>
    </AnimatedTouchable>
  );
};
