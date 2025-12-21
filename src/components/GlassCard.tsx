import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
// cleaned imports

// I'll create a simple helper for class names if cn doesn't exist, but usually standard setup includes it or clsx.
// Since I installed clsx and tailwind-merge, I should create a utils file or just inline it for now.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends ViewProps {
  className?: string;
  intensity?: number;
}

// Transparent container (Ghost)
export const GlassCard: React.FC<GlassCardProps> = ({ children, className, intensity, ...props }) => {
  return (
    <View className={className} {...props}>
        {children}
    </View>
  );
};
