import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Info, Heart, Settings } from 'lucide-react-native';

interface HeaderProps {
    onInfoPress: () => void;
    onSupportPress: () => void;
    onSettingsPress?: () => void;
    isSupporter?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onInfoPress, onSupportPress, onSettingsPress, isSupporter = false }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="flex-row items-center justify-between px-5 py-4 bg-transparent z-10 w-full">
            <TouchableOpacity 
                onPress={onSupportPress}
                className={`w-10 h-10 items-center justify-center rounded-full ${isSupporter ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-black/5 dark:bg-white/5'} active:bg-black/10 dark:active:bg-white/10`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Heart 
                    size={20} 
                    color={isSupporter ? "#F59E0B" : (isDark ? "#E6B778" : "#8B5A2B")} 
                    fill={isSupporter ? "#F59E0B" : "transparent"} 
                    opacity={isSupporter ? 1 : 0.8} 
                />
            </TouchableOpacity>

            <Text className="text-neutral-900 dark:text-white text-xl font-bold tracking-tight">
                Espresso Shot Timer
            </Text>
            
            <View className="flex-row gap-2">
                <TouchableOpacity 
                    onPress={onSettingsPress}
                    className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Settings size={20} color={isDark ? "#ffffff" : "#000000"} opacity={0.6} />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onInfoPress}
                    className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Info size={20} color={isDark ? "#ffffff" : "#000000"} opacity={0.6} />
                </TouchableOpacity>
            </View>
        </View>
    );
};
