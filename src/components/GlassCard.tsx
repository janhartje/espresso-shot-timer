import React from 'react';
import { View, ViewProps, Platform } from 'react-native';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends ViewProps {
  className?: string;
  intensity?: number;
  contentClassName?: string;
}

// Glassmorphism Card Component with Liquid Effect
export const GlassCard: React.FC<GlassCardProps> = ({ children, className, intensity = 25, contentClassName, ...props }) => {
  return (
    <View 
        className={cn(
            "rounded-[32px] overflow-hidden flex-1 w-full h-full",
            "bg-[#1A1A1A] border border-white/10",
            className
        )} 
        style={{

            shadowColor: "#000", 
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
        }}
        {...props}
    >
        {/* Content Container - w-full is critical here */}
        <View className={cn("flex-1 p-5 z-10 w-full h-full relative", contentClassName)}>
            {children}
        </View>
    </View>
  );
};
