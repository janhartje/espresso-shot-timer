import React from 'react';
import { Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, className }) => {
  return (
    <GlassCard 
        className={`${className}`}
        contentClassName="p-2 items-center justify-center"
    >
        {/* Header - Top Left Absolute */}
        <View className="absolute top-5 left-5 z-20">
             <Text className="text-zinc-500 dark:text-zinc-400 text-sm tracking-widest font-bold uppercase opacity-80">
                {label}
             </Text>
        </View>
      
      <View className="flex-1 w-full items-center justify-center px-2">
          <Text 
            className="text-neutral-900 dark:text-white text-[50px] font-medium tracking-tight dark:shadow-md text-center"
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {value}
          </Text>
          {subValue && (
            <Text 
                className="text-zinc-500 text-sm mt-1 text-center"
                adjustsFontSizeToFit
                numberOfLines={1}
            >
              {subValue}
            </Text>
          )}
      </View>
    </GlassCard>
  );
};
