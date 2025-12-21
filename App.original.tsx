import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { Settings, Play, Square, RotateCcw, Activity } from 'lucide-react-native';
import "./global.css";

import { useShotTimer, ShotStatus } from './src/hooks/useShotTimer';
import { GlassCard } from './src/components/GlassCard';
import { Visualizer } from './src/components/Visualizer';

export default function App() {
  useKeepAwake();
  const { 
    status, 
    elapsedTime, 
    currentMagnitude, 
    lastShotTime, 
    startTimer, 
    stopTimer, 
    resetTimer,
    calibrate,
    isCalibrating,
    baseline,
    threshold
  } = useShotTimer();

  // Format time: MM:SS.ms
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100); // 1 digit for ms
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
  };

  const getStatusText = (s: ShotStatus) => {
    switch (s) {
      case 'IDLE': return 'Ready';
      case 'BREWING': return 'Brewing';
      case 'FINISHED': return 'Done';
      default: return '';
    }
  };

  const getStatusColor = (s: ShotStatus) => {
    switch (s) {
      case 'IDLE': return 'text-gray-400';
      case 'BREWING': return 'text-accent-copper';
      case 'FINISHED': return 'text-green-400';
      default: return 'text-white';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8 mt-4">
          <View>
             <Text className="text-white text-3xl font-serif tracking-wider">Espresso</Text>
             <Text className="text-accent-copper text-sm uppercase tracking-[0.2em]">Shot Timer</Text>
          </View>
          <TouchableOpacity 
            onPress={isCalibrating ? undefined : calibrate}
            className={`p-3 rounded-full ${isCalibrating ? 'bg-accent-copper' : 'bg-white/10'}`}
          >
            {isCalibrating ? (
                <Activity size={24} color="#121212" />
            ) : (
                <Settings size={24} color="#D4AF37" />
            )}
          </TouchableOpacity>
        </View>

        {/* Main Grid */}
        <View className="flex-1 gap-4">
          
          {/* Tile 1: Timer (Large) */}
          <GlassCard className="h-64 justify-center items-center">
             <Text className={`text-sm uppercase tracking-widest mb-2 ${getStatusColor(status)}`}>
               {isCalibrating ? 'Calibrating...' : getStatusText(status)}
             </Text>
             <Text className="text-6xl font-black text-white tracking-tighter tabular-nums" style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
               {formatTime(elapsedTime)}
             </Text>
             
             {/* Manual Controls */}
             <View className="flex-row gap-6 mt-8">
               {status === 'BREWING' ? (
                 <TouchableOpacity onPress={stopTimer} className="bg-red-500/20 p-4 rounded-full border border-red-500/50">
                   <Square size={24} color="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                 </TouchableOpacity>
               ) : (
                 <TouchableOpacity onPress={startTimer} className="bg-accent-copper/20 p-4 rounded-full border border-accent-copper/50">
                   <Play size={24} color="#D4AF37" fill="#D4AF37" fillOpacity={0.5} />
                 </TouchableOpacity>
               )}
               
               <TouchableOpacity onPress={resetTimer} className="bg-white/5 p-4 rounded-full border border-white/10">
                 <RotateCcw size={24} color="#ffffff" />
               </TouchableOpacity>
             </View>
          </GlassCard>

          {/* Tile 2: Visualizer (Medium) */}
          <GlassCard className="h-40 justify-between">
             <View className="flex-row justify-between items-start">
                <Text className="text-white/60 text-xs uppercase tracking-wider">Vibration Monitor</Text>
                <Text className="text-accent-copper/80 text-xs">
                    {currentMagnitude.toFixed(2)}g / Thr: {threshold.toFixed(2)}g
                </Text>
             </View>
             <View className="flex-1 justify-center">
                 <Visualizer magnitude={currentMagnitude} isActive={status === 'BREWING'} />
             </View>
          </GlassCard>

          {/* Tile 3: Last Shot (Small) */}
          <GlassCard className="h-32 justify-center items-start pl-6">
             <Text className="text-white/60 text-xs uppercase tracking-wider mb-1">Last Shot</Text>
             <Text className="text-3xl text-white font-bold tabular-nums">
               {lastShotTime ? formatTime(lastShotTime) : '--:--'}
             </Text>
          </GlassCard>

        </View>

        {/* Footer */}
        <View className="mt-8 mb-4 items-center">
          <Text className="text-white/30 text-xs text-center">
            Place phone on drip tray or machine top.
          </Text>
          <Text className="text-white/10 text-[10px] mt-1 text-center font-mono">
            Baseline: {baseline.toFixed(3)}g
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
