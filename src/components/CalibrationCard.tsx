import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Activity } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import i18n from '../i18n';

interface CalibrationCardProps {
  onPress: () => void;
  isCalibrating?: boolean;
  className?: string; 
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CalibrationCard: React.FC<CalibrationCardProps> = ({ onPress, isCalibrating, className }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
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
    <AnimatedTouchable 
        onPress={handlePress} 
        className={`flex-1 w-full h-full ${className}`} 
        activeOpacity={0.9} 
        style={[animatedStyle, { flex: 1, width: '100%' }]} 
        disabled={isCalibrating}
    >
        <GlassCard 
            className="flex-1 w-full h-full"
            contentClassName="items-center justify-center"
        >
            <View className="items-center justify-center gap-2 w-full px-2">
                {isCalibrating ? (
                    <ActivityIndicator color="#E6B778" size="large" />
                ) : (
                    <Activity size={32} color="#E6B778" strokeWidth={1.5} style={{ opacity: 0.9 }} /> 
                )}
                
                <Text 
                    className={`text-lg font-medium tracking-wide text-center ${isCalibrating ? 'text-white' : 'text-[#E6B778]'}`}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                >
                    {isCalibrating ? i18n.t('calibrating') : i18n.t('calibrate')}
                </Text>
            </View>
        </GlassCard>
    </AnimatedTouchable>
  );
};
