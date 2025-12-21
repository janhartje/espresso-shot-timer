import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, ActivityIndicator, Alert, useWindowDimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Heart, Coffee, Star, Crown, CheckCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';
import i18n from '../i18n';
import { getOfferings, purchasePackage, restorePurchases, isRevenueCatConfigured } from '../utils/revenueCat';
import { storage } from '../utils/storage';

interface SupportOverlayProps {
    isVisible: boolean;
    onClose: () => void;
}

export const SupportOverlay: React.FC<SupportOverlayProps> = ({ isVisible, onClose }) => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            loadOfferings();
        }
    }, [isVisible]);

    const loadOfferings = async () => {
        setLoading(true);
        const offerings = await getOfferings();
        if (offerings && offerings.availablePackages) {
            setPackages(offerings.availablePackages);
        }
        setLoading(false);
    };

    const handlePurchase = async (pack: PurchasesPackage) => {
        setPurchaseLoading(true);
        try {
            const customerInfo = await purchasePackage(pack);
            if (customerInfo) {
                await storage.setIsSupporter(true);
                setSuccessMessage(i18n.t('support.thankYouDesc'));
            }
        } catch (e) {
            // Error handling is done in purchasePackage regarding user cancellation
            // Generic error alert could be added here if needed
        } finally {
            setPurchaseLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!isRevenueCatConfigured()) {
            Alert.alert(
                "Not Available",
                "Purchase restoration requires a native build. This feature is not available in Expo Go."
            );
            return;
        }

        setPurchaseLoading(true);
        try {
            const customerInfo = await restorePurchases();
            if (customerInfo && customerInfo.activeSubscriptions.length > 0) {
                await storage.setIsSupporter(true);
                Alert.alert("Success", "Purchases restored successfully!");
            } else {
                Alert.alert("No Purchases", "No previous purchases found to restore.");
            }
        } catch (e) {
            Alert.alert("Error", "Failed to restore purchases.");
        } finally {
            setPurchaseLoading(false);
        }
    };

    if (!isVisible) return null;

    const renderPackageIcon = (identifier: string) => {
        if (identifier.includes('small')) return <Coffee size={24} color="#E6B778" />;
        if (identifier.includes('medium')) return <Star size={24} color="#E6B778" />;
        if (identifier.includes('large') || identifier.includes('monthly')) return <Crown size={24} color="#E6B778" />;
        return <Heart size={24} color="#E6B778" />;
    };

    const renderMainContent = () => {
        if (successMessage) {
            return (
                <View className="items-center py-8 bg-green-500/10 rounded-2xl border border-green-500/20 mb-6">
                    <CheckCircle size={48} color="#4ADE80" style={{ marginBottom: 16 }} />
                    <Text className="text-white text-xl font-bold mb-2">{i18n.t('support.thankYou')}</Text>
                    <Text className="text-white/70 text-center px-4">{successMessage}</Text>
                </View>
            );
        }

        if (loading) {
            return (
                <View className="py-10">
                    <ActivityIndicator size="large" color="#E6B778" />
                </View>
            );
        }

        return (
            <View className="gap-3 mb-6">
                {packages.length > 0 ? (
                    packages.map((pack) => {
                        const titleKey = `products.${pack.product.identifier}.title`;
                        const descKey = `products.${pack.product.identifier}.description`;
                        
                        const translatedTitle = i18n.t(titleKey, { defaultValue: pack.product.title });
                        const translatedDesc = i18n.t(descKey, { defaultValue: pack.product.description });
                        
                        const title = translatedTitle.includes('[missing') ? pack.product.title : translatedTitle;
                        const description = translatedDesc.includes('[missing') ? pack.product.description : translatedDesc;

                        return (
                        <TouchableOpacity
                            key={pack.identifier}
                            onPress={() => handlePurchase(pack)}
                            disabled={purchaseLoading}
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-row items-center gap-4 active:bg-white/10"
                        >
                            <View className="w-12 h-12 rounded-full bg-white/5 items-center justify-center">
                                {renderPackageIcon(pack.product.identifier)}
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg">
                                    {title}
                                </Text>
                                <Text className="text-white/50 text-sm">
                                    {description}
                                </Text>
                            </View>
                            <View className="bg-white/10 px-3 py-1.5 rounded-full">
                                <Text className="text-[#E6B778] font-bold">
                                    {pack.product.priceString}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )})
                ) : (
                    <View className="py-8 items-center">
                        <Text className="text-white/50 italic">
                            No offerings found. Check configuration.
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(300)} 
            exiting={FadeOut.duration(300)}
            style={[StyleSheet.absoluteFill, { zIndex: 999, justifyContent: 'center', alignItems: 'center' }]}
        >
             {Platform.OS === 'ios' ? (
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)' }]} />
            )}

            <View 
                className={`w-full ${isLandscape ? 'max-w-4xl' : 'max-w-md'}`}
                style={{ 
                    maxHeight: '85%',
                    paddingHorizontal: 20,
                    height: isLandscape ? '80%' : undefined
                }}
            >
                <View className={`bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-black ${isLandscape ? 'flex-1' : ''}`}>
                     {/* Header */}
                     <View className="items-center px-6 pt-6 pb-4">
                        {/* Close Button - Top Right */}
                        <TouchableOpacity 
                            onPress={onClose}
                            className="absolute right-4 top-4 w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20 z-10"
                        >
                            <X size={20} color="#FFF" opacity={0.8} />
                        </TouchableOpacity>
                        
                        {/* App Icon */}
                        <Image 
                            source={require('../../assets/icon.png')} 
                            className="w-16 h-16 rounded-2xl mb-3"
                            resizeMode="contain"
                        />
                        
                        {/* Title */}
                        <Text className="text-white text-2xl font-bold tracking-tight text-center">
                            {i18n.t('support.title')}
                        </Text>
                    </View>

                    {isLandscape ? (
                        <View className="flex-1 flex-row">
                            {/* Left Column: Description & Restore */}
                            <View className="flex-1 p-6 pt-0 justify-between">
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text className="text-white/80 text-base leading-relaxed">
                                        {i18n.t('support.description')}
                                    </Text>
                                </ScrollView>
                                <View className="pt-4 border-t border-white/5 mt-4">
                                     {!successMessage && (
                                        <TouchableOpacity 
                                            onPress={handleRestore}
                                            disabled={purchaseLoading}
                                            className="flex-row items-center gap-2 opacity-50 active:opacity-100"
                                        >
                                            <CheckCircle size={16} color="white" />
                                            <Text className="text-white text-sm font-medium underline">
                                                {i18n.t('support.restore')}
                                            </Text>
                                        </TouchableOpacity>
                                     )}
                                </View>
                            </View>

                            {/* Right Column: Packages */}
                            <View className="flex-1 bg-black/20 border-l border-white/5">
                                <ScrollView 
                                    className="flex-1 px-6 py-6"
                                    contentContainerStyle={{ paddingBottom: 24 }}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {renderMainContent()}
                                </ScrollView>
                            </View>
                        </View>
                    ) : (
                        /* Portrait Layout */
                        <ScrollView 
                            className="px-6"
                            contentContainerStyle={{ paddingBottom: 24 }}
                            showsVerticalScrollIndicator={false}
                        >
                             <View className="mb-6">
                                <Text className="text-white/80 text-base leading-relaxed text-center">
                                    {i18n.t('support.description')}
                                </Text>
                            </View>

                            {renderMainContent()}

                            {!successMessage && (
                                <TouchableOpacity 
                                    onPress={handleRestore}
                                    disabled={purchaseLoading}
                                    className="items-center py-3"
                                >
                                    <Text className="text-white/40 text-sm font-medium underline">
                                        {i18n.t('support.restore')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};
