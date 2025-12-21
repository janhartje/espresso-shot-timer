import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShotStatus } from '../hooks/useShotTimer';

interface TimerCardProps {
  elapsedTime: number;
  status: ShotStatus;
  isCalibrating: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string; 
}

export const TimerCard: React.FC<TimerCardProps> = ({ 
    elapsedTime, 
    status, 
    isCalibrating, 
    onStart,
    onStop,
    onReset,
    className 
}) => {
  // Time formatting
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100); 
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
        main: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        ms: `.${milliseconds}`
    };
  };

  const timeParts = formatTime(elapsedTime);

  return (
    <View className={`items-center justify-center ${className}`}>
      {/* Digital Display */}
      <View className="items-center mb-8">
        <Text className="text-zinc-500 text-sm mb-2 tracking-widest font-bold">TIMER</Text>
        <View className="flex-row items-baseline">
            <Text className="text-white text-7xl font-bold font-mono">
                {timeParts.main}
            </Text>
            <Text className="text-zinc-500 text-4xl font-mono ml-1">
                {timeParts.ms}
            </Text>
        </View>
      </View>

      {/* Basic Buttons */}
      <View className="flex-row items-center gap-6">
          {status === 'BREWING' ? (
               <TouchableOpacity onPress={onStop} className="bg-red-600 px-8 py-4 rounded-lg active:opacity-80">
                  <Text className="text-white font-bold text-lg">STOP</Text>
               </TouchableOpacity>
          ) : (
               <TouchableOpacity onPress={onStart} className="bg-blue-600 px-8 py-4 rounded-lg active:opacity-80">
                  <Text className="text-white font-bold text-lg">START</Text>
               </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onReset} className="bg-zinc-800 px-6 py-4 rounded-lg active:opacity-80">
              <Text className="text-white font-bold text-lg">RESET</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};
