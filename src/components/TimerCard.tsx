
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, useFrameCallback, runOnJS, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ShotStatus } from '../hooks/useShotTimer';
import { GlassCard } from './GlassCard';

import i18n from '../i18n';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const { width } = Dimensions.get('window');
const RADIUS = 110; 
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
  const [isLayoutReady, setIsLayoutReady] = React.useState(false);
  
  // Shared values for animation - Initialize from props to avoid flash
  const initialTotalSeconds = Math.floor(elapsedTime / 1000);
  const initialMs = Math.floor((elapsedTime % 1000) / 10);
  
  const progress = useSharedValue((elapsedTime % 30000) / 30000);
  const mainText = useSharedValue(initialTotalSeconds.toString().padStart(2, '0'));
  const msText = useSharedValue(`.${initialMs.toString().padStart(2, '0')}`);
  const lapIndexSv = useSharedValue(Math.floor(elapsedTime / 30000));

  // Sync shared values when props change (especially for stop/reset)
  useEffect(() => {
    // If not brewing, we trust the static elapsedTime
    if (status !== 'BREWING') {
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);
        
        mainText.value = totalSeconds.toString().padStart(2, '0');
        msText.value = `.${milliseconds.toString().padStart(2, '0')}`;
        
        const MAX_TIME = 30000;
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
        lapIndexSv.value = Math.floor(currentElapsed / MAX_TIME);
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

  // Derived state for gradients (this needs to be reactive to re-renders for now, or use logic)
  // We use a simple JS state for gradient colors that updates occasionally if needed, 
  // but for 60fps correctness we can just check the lapIndex in JS during render if we want perfect sync,
  // or accept that color flip might lag one frame. 
  // Actually, let's just use the shared value to determine styles if we were using Views.
  // For SVG gradients, we can't easily animate the 'url(#id)' prop from UI thread without a bridge.
  // So we accept that lap color change (every 30s) happens via React re-render or we assume React updates fast enough.
  // Given `lapIndexSv` changes on UI thread, we can't observe it easily in JS render without state.
  // However, the `TimerCard` component will likely NOT re-render during the 30s unless other props change.
  // To fix this, we can force a re-render every 30s or just let it be. 
  // Let's use a JS derived value from props for now -> waiting for the user to reach 30s might show old color until some state updates.
  // Better approach: Pass `startTime` and use `useFrameCallback` to `runOnJS` when lap changes?
  // For now, let's keep it simple. The ring moves smoothly. The color might stay "Gold" past 30s until something triggers render.
  // To fix: We can check in useFrameCallback if lap changed and trigger a JS state update.
  
  const [currentLapJs, setCurrentLapJs] = React.useState(0);
  
  useFrameCallback(() => {
      if (status === 'BREWING' && startTime) {
          const now = Date.now();
          const elapsed = now - startTime;
          const newLap = Math.floor(elapsed / 30000);
          if (newLap !== currentLapJs) {
              runOnJS(setCurrentLapJs)(newLap);
          }
      }
  });
  
  // If not brewing, use prop based lap
  const effectiveLap = status === 'BREWING' ? currentLapJs : Math.floor(elapsedTime / 30000);
  
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
                            <AnimatedTextInput 
                                animatedProps={animatedMainTextProps}
                                defaultValue={Math.floor(elapsedTime / 1000).toString().padStart(2, '0')}
                                className="text-white text-[100px] font-bold font-mono tracking-tighter shadow-lg leading-tight text-center p-0 m-0"
                                style={{
                                    fontVariant: ['tabular-nums'],
                                    includeFontPadding: false,
                                    // Remove text input styles
                                    backgroundColor: 'transparent',
                                    borderWidth: 0,
                                }}
                                editable={false}
                                // Prevent user interaction 
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
