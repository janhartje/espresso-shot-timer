import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';

interface VisualizerProps {
  magnitude: number;
  isActive: boolean;
}

const Bar = ({ index, magnitude, isActive, totalBars }: { index: number; magnitude: number; isActive: boolean; totalBars: number }) => {
    const height = useSharedValue(6); // Default idle height

    useEffect(() => {
        if (isActive) {
            // Simulate "organic" frequency response
            // Center bars react stronger than side bars
            // Create a symmetric "bell curve" bias so center bars are taller
            // Normalized position -1 to 1
            const pos = (index - totalBars / 2) / (totalBars / 2); 
            const centerBias = Math.exp(-2 * pos * pos); // Gaussian bell curve
            const randomVar = Math.random() * 0.5 + 0.5; // Random flicker
            
            // Target height based on magnitude + bias + randomness
            // Boost multiplier to 400 for more dramatic effect
            let targetHeight = Math.min(magnitude * 400 * centerBias * randomVar, 120); 
            
            // Ensure min height
            targetHeight = Math.max(targetHeight, 6);

            height.value = withSpring(targetHeight, {
                damping: 10,
                stiffness: 200, 
                mass: 0.5
            });
        } else {
             // Idle "Breathing" - Smooth transition from potentially high value
             height.value = withSequence(
                 withTiming(6, { duration: 500, easing: Easing.out(Easing.cubic) }), // Ease out to baseline
                 withRepeat(
                    withSequence(
                        withTiming(6 + Math.sin(index) * 3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                        withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                    ),
                    -1,
                    true
                 )
             );
        }
    }, [magnitude, isActive]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: height.value,
            backgroundColor: '#a1a1aa', // Zinc-400
            opacity: 1,
            borderRadius: 2,
            width: 4, 
            marginHorizontal: 2
        };
    });

    return <Animated.View style={animatedStyle} />;
};

export const Visualizer: React.FC<VisualizerProps> = ({ magnitude, isActive }) => {
  return (
    <View className="flex-1 items-center justify-center">
        <Text className="text-zinc-500 text-sm">VIBRATION</Text>
        <Text className="text-white text-2xl font-bold">
            {magnitude.toFixed(4)}
        </Text>
    </View>
  );
};
