import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Play, Square, RotateCcw, Settings } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { ShotStatus } from '../hooks/useShotTimer';
import i18n from '../i18n';

interface ControlCardProps {
  status: ShotStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onCalibrate: () => void;
  className?: string;
}

export const ControlCard: React.FC<ControlCardProps> = ({ 
    status, 
    onStart, 
    onStop, 
    onReset, 
    onCalibrate,
    className 
}) => {
  return (
    <GlassCard className={`flex-row items-center justify-between px-6 py-4 ${className}`}>
        {/* Main Action (Start/Stop) */}
        {status === 'BREWING' ? (
            <TouchableOpacity 
                onPress={onStop} 
                className="flex-1 bg-red-500/20 h-12 rounded-full items-center justify-center border border-red-500/30 flex-row gap-2 active:bg-red-500/30"
            >
                <Square size={18} color="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                <Text className="text-red-400 font-bold uppercase tracking-wide text-xs">{i18n.t('stop')}</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity 
                onPress={onStart} 
                className="flex-1 bg-accent-copper/20 h-12 rounded-full items-center justify-center border border-accent-copper/30 flex-row gap-2 active:bg-accent-copper/30"
            >
                <Play size={18} color="#D4AF37" fill="#D4AF37" fillOpacity={0.5} />
                <Text className="text-accent-copper font-bold uppercase tracking-wide text-xs">{i18n.t('start')}</Text>
            </TouchableOpacity>
        )}

        {/* Spacer */}
        <View className="w-4" />

        {/* Secondary Actions */}
        <View className="flex-row gap-3">
            <TouchableOpacity 
                onPress={onReset} 
                className="bg-white/5 h-12 w-12 rounded-full items-center justify-center border border-white/10 active:bg-white/10"
            >
                <RotateCcw size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={onCalibrate} 
                className="bg-white/5 h-12 w-12 rounded-full items-center justify-center border border-white/10 active:bg-white/10"
            >
                <Settings size={20} color="#ffffff" />
            </TouchableOpacity>
        </View>
    </GlassCard>
  );
};
