
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { ShotStatus } from '../hooks/useShotTimer';
import { GlassCard } from './GlassCard';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');
const RADIUS = 110; 
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerCardProps {
  elapsedTime: number;
  status: ShotStatus;
  isCalibrating: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onToggleDebug?: () => void;
  className?: string; 
}

export const TimerCard: React.FC<TimerCardProps> = ({ 
    elapsedTime, 
    status, 
    isCalibrating, 
    onStart,
    onStop,
    onReset,
    onToggleDebug,
    className 
}) => {
  // Initialize with a safe default size to prevent invisibility
  const [dimensions, setDimensions] = React.useState({ width: 300, height: 300 });
  const [isLayoutReady, setIsLayoutReady] = React.useState(false);
  const progress = useSharedValue(0);

  // Debug Tap Refs
  const lastTapRef = React.useRef<number>(0);
  const tapCountRef = React.useRef<number>(0);

    // Time formatting
    const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10); 
    
    return {
        main: `${totalSeconds.toString().padStart(2, '0')}`,
        ms: `.${milliseconds.toString().padStart(2, '0')}`
    };
    };

    const timeParts = formatTime(elapsedTime);

    // Calculate laps and progress
    const MAX_TIME = 30000;
    const lapIndex = Math.floor(elapsedTime / MAX_TIME);
    // If not idle/reset, we want smooth looping
    // Use modulo for progress
    const lapProgress = (elapsedTime % MAX_TIME) / MAX_TIME;
    
    // Determine gradient to use
    // Lap 0 (0-30s): Gold (#grad) -> Track is Dim
    // Lap 1 (30-60s): Red (#gradRed) -> Track is Gold (#grad)
    // Lap 2 (60-90s): Gold (#grad) -> Track is Red (#gradRed)
    
    const isEvenLap = lapIndex % 2 === 0;
    const activeGradient = isEvenLap ? "url(#grad)" : "url(#gradRed)";
    
    // Track color logic:
    // If lap 0: Dim static color
    // If lap > 0: The gradient of the *completed* lap (which is the opposite of the current active one)
    const trackStroke = lapIndex === 0 ? "rgba(255,255,255,0.05)" : (isEvenLap ? "url(#gradRed)" : "url(#grad)");
    const trackOpacity = lapIndex === 0 ? 1 : 1; // Keep previous lap fully visible

    // Direct update without animation for responsiveness
    useEffect(() => {
        progress.value = lapProgress; 
    }, [lapProgress]);

    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
            setDimensions({ width, height });
            setIsLayoutReady(true);
        }
    };

    // Calculate dynamic radius
    const minDim = Math.min(dimensions.width, dimensions.height);
    const radius = Math.max((minDim - 40) / 2, 60); 
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    
    const animatedProps = useAnimatedProps(() => {
    return {
        strokeDashoffset: circumference * (1 - progress.value),
    };
    }, [circumference]); // Re-create when circumference changes

    return (
    <GlassCard 
        className={`items-center justify-center ${className}`}
        contentClassName="p-4"
    >
        {/* Header - Top Left Absolute */}
        <View className="absolute top-5 left-5 z-20">
            <Text className="text-zinc-400 text-lg font-normal tracking-wide opacity-90">Timer</Text>
        </View>

        {/* Ring Container - Fills space */}
        <View className="flex-1 w-full items-center justify-center" onLayout={onLayout}>
            <View className="relative items-center justify-center">
                {/* SVG Layer */}
                <View>
                    <Svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
                        <Defs>
                            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor="#C88A53" />
                                <Stop offset="100%" stopColor="#E6B778" />
                            </LinearGradient>
                            <LinearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor="#ef4444" />
                                <Stop offset="100%" stopColor="#f87171" />
                            </LinearGradient>
                        </Defs>
                        {/* Track - Represents previous lap or empty state */}
                        <Circle
                            cx={radius + strokeWidth}
                            cy={radius + strokeWidth}
                            r={radius}
                            stroke={trackStroke}
                            strokeOpacity={trackOpacity}
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress Indicator */}
                        <G rotation="-90" origin={`${radius + strokeWidth}, ${radius + strokeWidth}`}>
                            <AnimatedCircle
                                cx={radius + strokeWidth}
                                cy={radius + strokeWidth}
                                r={radius}
                                stroke={activeGradient}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={`${circumference} ${circumference}`}
                                animatedProps={animatedProps}
                            />
                        </G>
                    </Svg>
                </View>

                {/* Time Text Layer */}
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                         <View className="flex-row items-baseline justify-center w-full px-4">
                            <Text 
                                className="text-white text-[100px] font-bold font-mono tracking-tighter shadow-lg leading-tight text-center"
                                adjustsFontSizeToFit
                                numberOfLines={1}
                            >
                                {timeParts.main}
                            </Text>
                             <Text 
                                className="text-accent-copper text-[50px] font-mono font-medium opacity-80 leading-tight"
                                adjustsFontSizeToFit
                                numberOfLines={1}
                             >
                                 {timeParts.ms}
                             </Text>
                         </View>
                    </View>
            </View>
        </View>

        {/* Controls Overlay & Debug Tap Area */}
        <TouchableOpacity 
            onPress={(e) => {
                // Handle Debug Taps
                const now = Date.now();
                // Relaxed timing for easier activation
                if (now - lastTapRef.current < 800) {
                    tapCountRef.current += 1;
                } else {
                    tapCountRef.current = 1;
                }
                lastTapRef.current = now;
                
                if (tapCountRef.current >= 5) {
                    if (onToggleDebug) onToggleDebug();
                    tapCountRef.current = 0;
                }

                // Handle Normal Press
                if (status === 'BREWING') {
                    onStop();
                } else {
                    onStart();
                }
            }}
            onLongPress={onReset}
            className="absolute -inset-6 z-50"
            activeOpacity={1}
        />
        

    </GlassCard>
  );
};
