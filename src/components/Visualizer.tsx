import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

interface VisualizerProps {
  magnitude: number;
  isActive: boolean;
  className?: string;
}

const BAR_COUNT = 30;

const Bar = ({ index, magnitude, isActive, totalBars }: { index: number; magnitude: number; isActive: boolean; totalBars: number }) => {
    const height = useSharedValue(4); // Default idle height

    useEffect(() => {
        if (isActive) {
            // Simulate "organic" frequency response with liquid elasticity
            const pos = (index - totalBars / 2) / (totalBars / 2); 
            const centerBias = Math.exp(-2.5 * pos * pos); // Slightly wider spread
            const randomVar = Math.random() * 0.3 + 0.7; // Less jitter, more smooth flow
            
            // Target height
            // Increase max height slightly for drama
            let targetHeight = Math.min(magnitude * 800 * centerBias * randomVar, 160); 
            
            // Ensure min height
            targetHeight = Math.max(targetHeight, 6);

            height.value = withSpring(targetHeight, {
                damping: 14, // Slightly more damped for "thick liquid" feel
                stiffness: 120, // Softer spring
            });
        } else {
             // Idle Wave - "Breathing" Liquid
             height.value = withSequence(
                 withTiming(4, { duration: 400 }), 
                 withRepeat(
                    withSequence(
                        withTiming(4 + Math.sin(index / 1.5) * 5, { duration: 1200 + index * 60, easing: Easing.inOut(Easing.quad) }),
                        withTiming(4, { duration: 1200 + index * 60, easing: Easing.inOut(Easing.quad) })
                    ),
                    -1,
                    true
                 )
             );
        }
    }, [magnitude, isActive]);

    const animatedStyle = useAnimatedStyle(() => {
        // Opacity and slight width variation for "lens" effect
        const pos = Math.abs(index - totalBars / 2) / (totalBars / 2);
        const opacity = 1 - pos * 0.4;

        return {
            height: height.value,
            backgroundColor: '#E6B778', // Gold
            opacity: opacity,
            borderRadius: 99, // Pill shape
            flex: 1, // Dynamic width
            maxWidth: 16, // Prevent becoming too blocky on huge screens
            shadowColor: '#E6B778',
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2
        };
    });

    return <Animated.View style={animatedStyle} />;
};

export const Visualizer: React.FC<VisualizerProps> = ({ magnitude, isActive, className }) => {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => i);

  return (
    <GlassCard className={`justify-between ${className}`} contentClassName="p-0">
        <View className="absolute top-5 left-5 z-20">
             <Text className="text-zinc-400 text-lg font-normal tracking-wide opacity-90">Vibration</Text>
        </View>
        
        <View className="flex-1 flex-row items-center justify-center h-full w-full pt-10 px-4 gap-[3px]">
            {bars.map((i) => (
                <Bar 
                    key={i} 
                    index={i} 
                    magnitude={magnitude} 
                    isActive={isActive} 
                    totalBars={BAR_COUNT} 
                />
            ))}
        </View>
    </GlassCard>
  );
};
