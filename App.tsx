import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, SafeAreaView, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Settings } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import "./global.css";

import { useShotTimer } from './src/hooks/useShotTimer';
import { Visualizer } from './src/components/Visualizer';
import { CalibrationOverlay } from './src/components/CalibrationOverlay';
import { TimerCard } from './src/components/TimerCard';
import { StatCard } from './src/components/StatCard';
import { GlassCard } from './src/components/GlassCard';
import { CalibrationCard } from './src/components/CalibrationCard';
import { AdBanner } from './src/components/AdBanner'; // Import AdBanner

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  React.useEffect(() => {
      console.log(`[Layout] Width: ${width}, Height: ${height}, Orientation: ${isLandscape ? 'LANDSCAPE' : 'PORTRAIT'}`);
  }, [width, height]);

  const { 
    status, 
    elapsedTime, 
    currentMagnitude, 
    lastShotTime, 
    startTimer, 
    stopTimer, 
    resetTimer,
    calibrate,
    cancelCalibration,
    isCalibrating,
    calibrationTimeLeft,
    calibrationFinished,
    baseline,
    threshold,
    sensitivityLevel,
    setSensitivityLevel,
    currentDeviation
  } = useShotTimer();

  // Helper for Last Shot format
  const formatTimeSimple = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${totalSeconds}.${milliseconds}s`;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar style="light" />
        
        <CalibrationOverlay 
          isVisible={isCalibrating} 
          onCancel={cancelCalibration} 
          timeLeft={calibrationTimeLeft} 
          isFinished={calibrationFinished}
        />

        <View className="flex-1 px-4 pb-4 pt-2">
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
              <View>
                 <Text className="text-white text-2xl font-serif tracking-wider">Espresso Sense</Text>
              </View>
          </View>

          {/* Main Content Area - Grid */}
          <View className={`flex-1 gap-4 ${isLandscape ? 'flex-row' : 'flex-col'}`}>
            
             {isLandscape ? (
                 <>
                    {/* Left Col: Timer */}
                    <View className="flex-1 h-full justify-center">
                        <TimerCard 
                            elapsedTime={elapsedTime} 
                            status={status} 
                            isCalibrating={isCalibrating}
                            onStart={startTimer}
                            onStop={stopTimer}
                            onReset={resetTimer}
                            className="flex-1 max-h-[500px]" // Limit height in landscape
                        />
                    </View>

                    {/* Right Col: Stats & Visualizer */}
                    <View className="w-80 gap-4">
                        {/* Top Row: Last Shot + Calibrate */}
                        <View className="h-24 flex-row gap-4">
                             <StatCard 
                                label="Last Shot" 
                                value={lastShotTime ? formatTimeSimple(lastShotTime) : '--'} 
                                className="flex-1"
                             />
                             <CalibrationCard 
                                onPress={calibrate}
                                isCalibrating={isCalibrating}
                                className="flex-1"
                             />
                        </View>
                        
                        <View className="flex-1 p-4 justify-between">
                            <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Vibration</Text>
                            <View className="flex-1 justify-center">
                                <Visualizer magnitude={currentMagnitude} isActive={status === 'BREWING'} />
                            </View>
                        </View>

                         <AdBanner />
                    </View>
                 </>
             ) : (
                 <>
                    {/* Top: Timer (Dominant Square) */}
                    <View className="w-full aspect-square mb-4"> 
                        <TimerCard 
                            elapsedTime={elapsedTime} 
                            status={status} 
                            isCalibrating={isCalibrating}
                            onStart={startTimer}
                            onStop={stopTimer}
                            onReset={resetTimer}
                            className="flex-1"
                        />
                    </View>

                     {/* Row: Last Shot + Calib */}
                    <View className="h-24 flex-row gap-4">
                         <StatCard 
                            label="Last Shot" 
                            value={lastShotTime ? formatTimeSimple(lastShotTime) : '--'} 
                            className="flex-1"
                         />
                         <CalibrationCard 
                            onPress={calibrate}
                            isCalibrating={isCalibrating}
                            className="flex-1"
                         />
                    </View>

                    {/* Visualizer */}
                    <View className="flex-1"> 
                        <View className="flex-1 p-4 justify-between">
                            <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Vibration</Text>
                            <View className="flex-1 justify-center">
                                <Visualizer magnitude={currentMagnitude} isActive={status === 'BREWING'} />
                            </View>
                        </View>
                    </View>

                    {/* Ad Footer */}
                    <AdBanner />
                 </>
             )}
          </View>

        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
