import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, useWindowDimensions, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, ChevronRight, RefreshCw, FileText, Shield, Scale, Coffee, Github } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { storage } from '../utils/storage';

interface InfoOverlayProps {
    isVisible: boolean;
    onClose: () => void;
    onResetOnboarding: () => void;
}

type LegalScreen = 'menu' | 'privacy' | 'imprint' | 'licenses';

const LegalContentScreen = ({ 
    title, 
    onBack, 
    children,
    isLandscape = false
}: { 
    title: string; 
    onBack?: () => void; 
    children: React.ReactNode;
    isLandscape?: boolean;
}) => (
    <>
        <View className={`flex-row items-center ${isLandscape ? 'mb-4' : 'mb-6'}`}>
            {!isLandscape && onBack && (
                <TouchableOpacity 
                    onPress={onBack}
                    className="mr-3 w-10 h-10 items-center justify-center rounded-full bg-white/10"
                >
                    <Text className="text-white text-xl">←</Text>
                </TouchableOpacity>
            )}
            <Text className="text-white text-2xl font-bold tracking-tight flex-1">
                {title}
            </Text>
        </View>
        <ScrollView 
            className=""
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    </>
);

const PrivacyContent = () => (
    <View>
        <Text className="text-white/90 text-base leading-relaxed mb-4">
            {i18n.t('privacyContent.intro')}
        </Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-4">
            <Text className="font-bold text-white/80">{i18n.t('privacyContent.noDataCollection')}</Text>
            {i18n.t('privacyContent.noDataCollectionDesc')}
        </Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-4">
            <Text className="font-bold text-white/80">{i18n.t('privacyContent.sensorData')}</Text>
            {i18n.t('privacyContent.sensorDataDesc')}
        </Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-4">
            <Text className="font-bold text-white/80">{i18n.t('privacyContent.localStorage')}</Text>
            {i18n.t('privacyContent.localStorageDesc')}
        </Text>
    </View>
);

const ImprintContent = () => (
    <View>
        <Text className="text-white/90 text-base leading-relaxed mb-4">
            {i18n.t('imprintContent.header')}
        </Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-2">
            Jan Hartje
        </Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-4">
            E-Mail: jan@hartje.de
        </Text>
        <Text className="text-white/90 text-base leading-relaxed mb-4 mt-6">
            {i18n.t('imprintContent.disclaimer')}
        </Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-4">
            {i18n.t('imprintContent.disclaimerText')}
        </Text>
    </View>
);

const LicensesContent = () => (
    <View>
        <Text className="text-white/90 text-base leading-relaxed mb-4">
            {i18n.t('licensesContent.intro')}
        </Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-2">• React Native (MIT)</Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-2">• Expo (MIT)</Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-2">• Lucide Icons (ISC)</Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-2">• NativeWind (MIT)</Text>
        <Text className="text-zinc-400 text-sm leading-relaxed mb-2">• React Native Reanimated (MIT)</Text>
        <Text className="text-white/30 text-xs leading-relaxed mt-6">
            {i18n.t('licensesContent.fullText')}
        </Text>
    </View>
);

const AboutContent = () => (
    <View className="items-center py-6 mb-4 border-b border-white/5">
        <Text className="text-white text-xl font-bold mb-2">
            Espresso Shot Timer
        </Text>
        <Text className="text-zinc-400 text-sm mb-3">
            v1.0.0
        </Text>
        
        <TouchableOpacity 
            onPress={() => Linking.openURL('https://github.com/janhartje/espresso-shot-timer')}
            className="flex-row items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4 active:bg-white/20"
        >
            <Github size={16} color="#FFF" />
            <Text className="text-white font-medium text-sm">GitHub</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-1">
            <Text className="text-zinc-400 text-xs">Made with</Text>
            <Coffee size={12} color="#C88A53" />
            <Text className="text-zinc-400 text-xs">by Jan Hartje</Text>
        </View>
    </View>
);

const MenuRow = ({ 
    icon: Icon, 
    label, 
    onPress, 
    destructive = false,
    isActive = false
}: { 
    icon: any; 
    label: string; 
    onPress: () => void; 
    destructive?: boolean;
    isActive?: boolean;
}) => (
    <TouchableOpacity 
        onPress={onPress}
        className={`flex-row items-center justify-between py-4 border-b border-white/5 ${isActive ? 'bg-white/10' : 'active:bg-white/5'}`}
    >
        <View className="flex-row items-center gap-3">
            <Icon size={20} color={destructive ? "#EF4444" : "#E6B778"} />
            <Text className={`text-base font-medium ${destructive ? 'text-red-400' : 'text-white/90'}`}>
                {label}
            </Text>
        </View>
        {!destructive && <ChevronRight size={18} color="#ffffff40" />}
    </TouchableOpacity>
);

const MenuLinks = ({ 
    currentScreen, 
    onNavigate, 
    onResetOnboarding 
}: { 
    currentScreen: LegalScreen, 
    onNavigate: (screen: LegalScreen) => void, 
    onResetOnboarding: () => void 
}) => (
    <>
        <View className="mb-4">
            <Text className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                {i18n.t('legal')}
            </Text>
            <MenuRow 
                icon={Shield} 
                label={i18n.t('privacyPolicy')} 
                onPress={() => onNavigate('privacy')} 
                isActive={currentScreen === 'privacy'}
            />
            <MenuRow 
                icon={FileText} 
                label={i18n.t('imprint')} 
                onPress={() => onNavigate('imprint')} 
                isActive={currentScreen === 'imprint'}
            />
            <MenuRow 
                icon={Scale} 
                label={i18n.t('openSource')} 
                onPress={() => onNavigate('licenses')} 
                isActive={currentScreen === 'licenses'}
            />
        </View>

        <View>
            <Text className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                {i18n.t('settings')}
            </Text>
            <MenuRow 
                icon={RefreshCw} 
                label={i18n.t('resetOnboarding')} 
                onPress={onResetOnboarding} 
                destructive 
            />
        </View>
    </>
);

export const InfoOverlay: React.FC<InfoOverlayProps> = ({ isVisible, onClose, onResetOnboarding }) => {
    const [currentScreen, setCurrentScreen] = React.useState<LegalScreen>('menu');
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isLandscape = width > height;

    const handleClose = () => {
        setCurrentScreen('menu');
        onClose();
    };

    if (!isVisible) return null;

    // Content renderer based on current screen
    const renderContent = () => {
        switch (currentScreen) {
            case 'privacy':
                return <LegalContentScreen title={i18n.t('privacyPolicy')} onBack={() => setCurrentScreen('menu')} isLandscape={isLandscape}><PrivacyContent /></LegalContentScreen>;
            case 'imprint':
                return <LegalContentScreen title={i18n.t('imprint')} onBack={() => setCurrentScreen('menu')} isLandscape={isLandscape}><ImprintContent /></LegalContentScreen>;
            case 'licenses':
                return <LegalContentScreen title={i18n.t('openSource')} onBack={() => setCurrentScreen('menu')} isLandscape={isLandscape}><LicensesContent /></LegalContentScreen>;
            default:
                // For landscape 'menu' state, we show AboutContent in the detail pane
                return isLandscape ? (
                    <LegalContentScreen title={i18n.t('about')} isLandscape={isLandscape}>
                        <AboutContent />
                    </LegalContentScreen>
                ) : null;
        }
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(300)} 
            exiting={FadeOut.duration(300)}
            style={[StyleSheet.absoluteFill, { zIndex: 999, justifyContent: 'center', alignItems: 'center' }]}
        >
            {/* Background with Blur */}
            {Platform.OS === 'ios' ? (
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)' }]} />
            )}

            {/* Content Container */}
            <View 
                className={isLandscape ? "w-full h-full max-w-5xl" : "w-[90%] max-w-md"} 
                style={{ 
                    maxHeight: isLandscape ? '100%' : '85%',
                    paddingTop: isLandscape ? insets.top + 20 : 0,
                    paddingBottom: isLandscape ? insets.bottom + 20 : 0,
                    paddingHorizontal: isLandscape ? insets.left + 20 : 0, 
                }}
            >
                <View className={`bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-black ${isLandscape ? 'flex-1 flex-row' : ''}`}>
                    {isLandscape ? (
                        // Landscape Layout (Master-Detail)
                        <>
                            {/* Left Column (Master) - 35% */}
                            <View className="w-[35%] border-r border-white/10 flex-col">
                                <View className="p-6 border-b border-white/10 flex-row justify-between items-center">
                                    <Text className="text-white text-xl font-bold">{i18n.t('about')}</Text>
                                    <TouchableOpacity 
                                        onPress={handleClose}
                                        className="w-8 h-8 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                                    >
                                        <X size={16} color="#FFF" opacity={0.8} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 20 }}>
                                    <MenuLinks 
                                        currentScreen={currentScreen} 
                                        onNavigate={setCurrentScreen} 
                                        onResetOnboarding={onResetOnboarding} 
                                    />
                                </ScrollView>
                            </View>

                            {/* Right Column (Detail) - 65% */}
                            <View className="flex-1 bg-black/20">
                                <View className="p-8 flex-1">
                                    {renderContent()}
                                </View>
                            </View>
                        </>
                    ) : (
                        // Portrait Layout (Stack)
                        currentScreen === 'menu' ? (
                            <>
                                {/* Header */}
                                <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                                    <Text className="text-white text-2xl font-bold tracking-tight">
                                        {i18n.t('about')}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={handleClose}
                                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                                    >
                                        <X size={20} color="#FFF" opacity={0.8} />
                                    </TouchableOpacity>
                                </View>

                                {/* Menu Content */}
                                <ScrollView 
                                    className="px-6"
                                    contentContainerStyle={{ paddingBottom: 24 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <AboutContent />
                                    <MenuLinks 
                                        currentScreen={currentScreen} 
                                        onNavigate={setCurrentScreen} 
                                        onResetOnboarding={onResetOnboarding} 
                                    />
                                </ScrollView>
                            </>
                        ) : (
                            <View className="p-6">
                                {renderContent()}
                            </View>
                        )
                    )}
                </View>
            </View>
        </Animated.View>
    );
};
