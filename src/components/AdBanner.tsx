import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GlassCard } from './GlassCard';
import { Bean } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';

export const AdBanner = () => {
  const shimmerTranslate = useSharedValue(-300);

  useEffect(() => {
    // Run shimmer every 10 seconds
    shimmerTranslate.value = withRepeat(
        withDelay(
            10000, 
            withTiming(400, { duration: 1500, easing: Easing.linear })
        ),
        -1, // Infinite
        false
    );
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.9} className="flex-1">
        <View className="flex-1 w-full items-center justify-center">
            <View className="flex-row items-center px-4">
                <View className="w-6 h-6 items-center justify-center mr-3">
                    <Bean size={14} color="#f97316" />
                </View>

                <View>
                     <Text className="text-zinc-300 text-xs font-medium" numberOfLines={1}>
                        Premium Single Origin Beans
                    </Text>
                </View>

                <Text className="text-zinc-500 text-[10px] font-bold ml-2">Ad</Text>
            </View>
        </View>
    </TouchableOpacity>
  );
};
