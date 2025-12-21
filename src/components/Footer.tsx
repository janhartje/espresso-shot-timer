import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Info } from 'lucide-react-native';

interface FooterProps {
    onInfoPress: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onInfoPress }) => {
    return (
        <View className="items-center py-3">
            <TouchableOpacity 
                onPress={onInfoPress}
                className="w-9 h-9 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Info size={18} color="#ffffff" opacity={0.4} />
            </TouchableOpacity>
        </View>
    );
};
