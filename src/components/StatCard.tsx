import React from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, className }) => {
  return (
    <View className={`justify-center ${className}`}>
      <View className="mb-1">
          <Text className="text-zinc-500 text-sm font-medium">
            {label}
          </Text>
      </View>
      
      <View className="flex-row items-baseline">
          <Text className="text-white text-3xl font-bold">
            {value}
          </Text>
      </View>

      {subValue && (
        <Text className="text-zinc-600 text-xs mt-1">
          {subValue}
        </Text>
      )}
    </View>
  );
};
