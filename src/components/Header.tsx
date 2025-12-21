import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Info, Heart } from 'lucide-react-native';

interface HeaderProps {
    onInfoPress: () => void;
    onSupportPress: () => void;
    isSupporter?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onInfoPress, onSupportPress, isSupporter = false }) => {
    return (
        <View className="flex-row items-center justify-between px-5 py-4 bg-transparent z-10 w-full">
            <TouchableOpacity 
                onPress={onSupportPress}
                className={`w-10 h-10 items-center justify-center rounded-full ${isSupporter ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'} active:bg-white/10`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Heart 
                    size={20} 
                    color={isSupporter ? "#F59E0B" : "#E6B778"} 
                    fill={isSupporter ? "#F59E0B" : "transparent"} 
                    opacity={isSupporter ? 1 : 0.8} 
                />
            </TouchableOpacity>

            <Text className="text-white text-2xl font-bold tracking-tight">
                Espresso Shot Timer
            </Text>
            <TouchableOpacity 
                onPress={onInfoPress}
                className="w-10 h-10 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Info size={20} color="#ffffff" opacity={0.6} />
            </TouchableOpacity>
        </View>
    );
};
