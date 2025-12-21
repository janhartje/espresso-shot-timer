
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, useFrameCallback, runOnJS, useAnimatedStyle, withTiming, runOnUI } from 'react-native-reanimated';
import { ShotStatus } from '../hooks/useShotTimer';
import { GlassCard } from './GlassCard';

import i18n from '../i18n';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const { width } = Dimensions.get('window');

interface TimerCardProps {
  elapsedTime: number; // For initial/final state
  startTime: number | null; // For active counting
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
    startTime,
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
  
  // Initialize shared values with 0/empty to avoid reading props during initialization if that was the issue
  // (though checking props is usually fine, checking .value during render is the big no-no)
  const progress = useSharedValue(0);
  const mainText = useSharedValue("00");
  const msText = useSharedValue(".00");
  const lapIndexSv = useSharedValue(0);

  // Sync shared values in useEffect - this guarantees we are outside the render phase
  useEffect(() => {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);
    const MAX_TIME = 30000;
    
    mainText.value = totalSeconds.toString().padStart(2, '0');
    msText.value = `.${milliseconds.toString().padStart(2, '0')}`;
    
    // If not brewing, set progress based on static time
    if (status !== 'BREWING') {
        progress.value = (elapsedTime % MAX_TIME) / MAX_TIME;
        lapIndexSv.value = Math.floor(elapsedTime / MAX_TIME);
    }
  }, [elapsedTime, status]);


  useFrameCallback(() => {
    if (status === 'BREWING' && startTime) {
        const now = Date.now();
        const currentElapsed = now - startTime;
        
        // Update Text
        const totalSeconds = Math.floor(currentElapsed / 1000);
        const milliseconds = Math.floor((currentElapsed % 1000) / 10);
        
        mainText.value = totalSeconds.toString().padStart(2, '0');
        msText.value = `.${milliseconds.toString().padStart(2, '0')}`;

        // Update Ring
        const MAX_TIME = 30000;
        progress.value = (currentElapsed % MAX_TIME) / MAX_TIME;
        
        // Update Lap Index (used for color logic if we had safe way to read it)
        const newLap = Math.floor(currentElapsed / MAX_TIME);
        lapIndexSv.value = newLap;
    }
  });

  const animatedMainTextProps = useAnimatedProps(() => {
    return {
        text: mainText.value,
    } as any;
  });

  const animatedMsTextProps = useAnimatedProps(() => {
    return {
        text: msText.value,
    } as any;
  });

  // Derived state for gradients
  // Removing the runOnJS listener to prevent re-renders during active timer
  // This means color flip happens only on explicit re-renders (stop/start/reset)
  const effectiveLap = Math.floor(elapsedTime / 30000);
  const isEvenLap = effectiveLap % 2 === 0;
  const activeGradient = isEvenLap ? "url(#grad)" : "url(#gradRed)";
  const trackStroke = effectiveLap === 0 ? "rgba(255,255,255,0.05)" : (isEvenLap ? "url(#gradRed)" : "url(#grad)");
  const trackOpacity = 1;


  // Debug Tap Refs
  const lastTapRef = React.useRef<number>(0);
  const tapCountRef = React.useRef<number>(0);


    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
            setDimensions({ width, height });
        }
    };

    // Calculate dynamic radius
    const minDim = Math.min(dimensions.width, dimensions.height);
    const radius = Math.max((minDim - 40) / 2, 60); 
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    
    // We capture circumference in the closure. 
    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: circumference * (1 - progress.value),
        };
    }, [circumference]); 

    return (
    <GlassCard 
        className={`items-center justify-center ${className}`}
        contentClassName="p-4"
    >
        {/* Header - Top Left Absolute */}
        <View className="absolute top-5 left-5 z-20">
            <Text className="text-zinc-400 text-lg font-normal tracking-wide opacity-90">{i18n.t('timer')}</Text>
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
                        {/* Track */}
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
                            <AnimatedTextInput 
                                animatedProps={animatedMainTextProps}
                                defaultValue={Math.floor(elapsedTime / 1000).toString().padStart(2, '0')}
                                className="text-white text-[100px] font-bold font-mono tracking-tighter shadow-lg leading-tight text-center p-0 m-0"
                                style={{
                                    fontVariant: ['tabular-nums'],
                                    includeFontPadding: false,
                                    backgroundColor: 'transparent',
                                    borderWidth: 0,
                                }}
                                editable={false}
                            />
                             <AnimatedTextInput 
                                animatedProps={animatedMsTextProps}
                                defaultValue={`.${Math.floor((elapsedTime % 1000) / 10).toString().padStart(2, '0')}`}
                                className="text-accent-copper text-[50px] font-mono font-medium opacity-80 leading-tight p-0 m-0"
                                style={{
                                    fontVariant: ['tabular-nums'],
                                    includeFontPadding: false,
                                    backgroundColor: 'transparent',
                                    borderWidth: 0,
                                }}
                                editable={false}
                             />
                         </View>
                    </View>
            </View>
        </View>

        {/* Controls Overlay & Debug Tap Area */}
        <TouchableOpacity 
            onPress={(e) => {
                // Handle Debug Taps
                const now = Date.now();
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
