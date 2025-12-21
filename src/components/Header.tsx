import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Info } from 'lucide-react-native';

interface HeaderProps {
    onInfoPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onInfoPress }) => {
    return (
        <View className="flex-row items-center justify-between px-5 py-4 bg-transparent z-10 w-full">
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
