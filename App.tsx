import React from 'react';
import { View, Text, Platform, useWindowDimensions, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Settings } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import "./global.css";

import { useShotTimer } from './src/hooks/useShotTimer';
import { Visualizer } from './src/components/Visualizer';
import { CalibrationOverlay } from './src/components/CalibrationOverlay';
import { TimerCard } from './src/components/TimerCard';
import { StatCard } from './src/components/StatCard';
import { GlassCard } from './src/components/GlassCard';
import { CalibrationCard } from './src/components/CalibrationCard';
import { OnboardingOverlay } from './src/components/OnboardingOverlay';
import { storage } from './src/utils/storage';
import { DebugLogger } from './src/utils/logger';
import i18n from './src/i18n';
import { Header } from './src/components/Header';
import { InfoOverlay } from './src/components/InfoOverlay';
import { SupportOverlay } from './src/components/SupportOverlay';
import { SettingsOverlay } from './src/components/SettingsOverlay';
import { initRevenueCat } from './src/utils/revenueCat';


export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';



  // Onboarding & Info State
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showSupport, setShowSupport] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isSupporter, setIsSupporter] = React.useState(false);
  const [isOnboardingLoaded, setIsOnboardingLoaded] = React.useState(false);

  const checkOnboarding = async () => {
      try {
          const hasSeen = await storage.getHasSeenOnboarding();
          const supporterStatus = await storage.getIsSupporter();
          
          if (!hasSeen) {
              setShowOnboarding(true);
          }
          const isDebug = await storage.getDebugMode();
          if (isDebug) console.log('[App] checkOnboarding - isSupporter:', supporterStatus);
          setIsSupporter(supporterStatus);
      } catch (error) {
          console.error('Failed to check onboarding status:', error);
      } finally {
          setIsOnboardingLoaded(true);
      }
  };

  React.useEffect(() => {
    checkOnboarding();
    initRevenueCat();
  }, []);

  const { 
    status, 
    elapsedTime,
    startTime, 
    currentMagnitude, 
    lastShotTime, 
    startTimer, 
    stopTimer, 
    resetTimer,
    calibrate,
    cancelCalibration,
    isCalibrating,
    calibrationTimeLeft,
    calibrationFinished,
    baseline,
    threshold,
    sensitivityLevel,
    setSensitivityLevel,
    currentDeviation,
    debugMode,
    toggleDebugMode,
    areSettingsLoaded,
    hysteresisLevel,
    setHysteresis
  } = useShotTimer({ ignoreSensors: showOnboarding });

  // Stop timer when Info overlay opens
  React.useEffect(() => {
    if (showInfo && status === 'BREWING') {
      stopTimer();
    }
  }, [showInfo, status, stopTimer]);

  // Stop timer when Calibration overlay opens
  React.useEffect(() => {
    if (isCalibrating && status === 'BREWING') {
      stopTimer();
    }
  }, [isCalibrating, status, stopTimer]);

  // Stop timer when Support overlay opens
  React.useEffect(() => {
      if (showSupport && status === 'BREWING') {
          stopTimer();
      }
      
      // Refresh supporter status when overlay closes (in case purchase happened)
      if (!showSupport) {
          storage.getIsSupporter().then(setIsSupporter);
      }
  }, [showSupport, status, stopTimer]);

  // Debug Banner State
  const [showDebugBanner, setShowDebugBanner] = React.useState(false);
  const [debugBannerMessage, setDebugBannerMessage] = React.useState("");

  // Debug Logger
  const debugModeRef = React.useRef(debugMode);
  React.useEffect(() => { debugModeRef.current = debugMode; }, [debugMode]);
  const loggerRef = React.useRef(new DebugLogger(debugModeRef));
  const logger = loggerRef.current;


  // Helper for Last Shot format
  const formatTimeSimple = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${totalSeconds}.${milliseconds}s`;
  };

  const isAppReady = isOnboardingLoaded && areSettingsLoaded;

  if (!isAppReady) {
      return (
          <View className="flex-1 bg-[#050505] items-center justify-center">
              <StatusBar style="light" />
              {/* Optional: Add a logo or spinner here */}
          </View>
      );
  }





  return (
    <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 bg-brand-light dark:bg-[#050505]">
            <StatusBar style="auto" />
            
            {/* Background Gradient - Warm glow behind Timer (Dark Mode Only) */}
            {isDark && (
                <View className="absolute inset-0">
                <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                    <Defs>
                    <RadialGradient id="bgGlow" cx="25%" cy="40%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#C88A53" stopOpacity="0.15" />
                        <Stop offset="40%" stopColor="#8B5A2B" stopOpacity="0.08" />
                        <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGlow)" />
                </Svg>
                </View>
            )}
            
            <Header 
                onInfoPress={() => setShowInfo(true)} 
                onSupportPress={() => setShowSupport(true)}
                onSettingsPress={() => setShowSettings(true)}
                isSupporter={isSupporter}
            />

            <CalibrationOverlay 
            isVisible={isCalibrating} 
            onCancel={cancelCalibration} 
            timeLeft={calibrationTimeLeft} 
            isFinished={calibrationFinished}
            />

            <OnboardingOverlay 
                isVisible={showOnboarding} 
                onComplete={() => setShowOnboarding(false)} 
            />

            <InfoOverlay 
                isVisible={showInfo} 
                onClose={() => setShowInfo(false)}
                onResetOnboarding={async () => {
                    await storage.resetOnboarding();
                    setShowOnboarding(true);
                    setShowInfo(false);
                }}
            />

            <SupportOverlay
                isVisible={showSupport}
                onClose={() => setShowSupport(false)}
                debugMode={debugMode}
                onPurchaseComplete={() => setIsSupporter(true)}
                isSupporter={isSupporter}
            />

            <SettingsOverlay
                isVisible={showSettings}
                onClose={() => setShowSettings(false)}
                sensitivity={sensitivityLevel}
                onSensitivityChange={setSensitivityLevel}
                hysteresis={hysteresisLevel}
                onHysteresisChange={setHysteresis}
                debugMode={debugMode}
                onToggleDebug={toggleDebugMode}
            />

            <View className="flex-1 p-3">
            
            {/* Main Content Area - Reference Layout */}
            <View className="flex-1 w-full mx-auto">
                {isLandscape ? (
                    <View className="flex-1 flex-row gap-3 items-stretch">
                        {/* Column 1: Timer */}
                        <View 
                            className="shadow-lg shadow-black/50"
                            style={{ flex: 2.2 }}
                        >
                            <View className="flex-1 rounded-[32px] overflow-hidden">
                                <TimerCard 
                                    elapsedTime={elapsedTime} 
                                    startTime={startTime}
                                    status={status} 
                                    isCalibrating={isCalibrating}
                                    onStart={startTimer}
                                    onStop={stopTimer}
                                    onReset={resetTimer}
                                    onToggleDebug={() => {
                                        toggleDebugMode();
                                        const newMode = !debugMode;
                                        setDebugBannerMessage(newMode ? i18n.t('debugModeOn') : i18n.t('debugModeOff'));
                                        setShowDebugBanner(true);
                                        setTimeout(() => setShowDebugBanner(false), 2500);
                                    }}
                                    className="w-full h-full"
                                />
                            </View>
                        </View>

                        {/* Column 2: Visualizer */}
                        <View 
                            className="shadow-lg shadow-black/50"
                            style={{ flex: 1 }}
                        >
                            <View className="flex-1 rounded-[32px] overflow-hidden">
                                <Visualizer 
                                    magnitude={currentMagnitude} 
                                    isActive={status === 'BREWING'} 
                                    className="w-full h-full" 
                                />
                            </View>
                        </View>

                        {/* Column 3: Stats & Controls */}
                        <View 
                            className="flex-col gap-3"
                            style={{ flex: 1, alignSelf: 'stretch' }}
                        >
                            <View className="flex-1 w-full shadow-lg shadow-black/50">
                                <View className="flex-1 rounded-[32px] overflow-hidden">
                                    <StatCard 
                                        label={i18n.t('lastShot')} 
                                        value={lastShotTime ? formatTimeSimple(lastShotTime) : '--'} 
                                        className="flex-1 w-full"
                                    />
                                </View>
                            </View>
                            <View className="flex-1 w-full shadow-lg shadow-black/50">
                                <View className="flex-1 rounded-[32px] overflow-hidden">
                                    <CalibrationCard 
                                        onPress={calibrate}
                                        isCalibrating={isCalibrating}
                                        className="flex-1 w-full"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                ) : (
                    // Portrait Layout
                    <View className="flex-1 flex-col gap-3">
                        {/* Top: Timer (Larger) */}
                        <View 
                            className="shadow-lg shadow-black/50"
                            style={{ flex: 4.5 }}
                        >
                            <View className="flex-1 rounded-[32px] overflow-hidden">
                                <TimerCard 
                                    elapsedTime={elapsedTime} 
                                    startTime={startTime}
                                    status={status} 
                                    isCalibrating={isCalibrating}
                                    onStart={startTimer}
                                    onStop={stopTimer}
                                    onReset={resetTimer}
                                    onToggleDebug={() => {
                                        toggleDebugMode();
                                        const newMode = !debugMode;
                                        setDebugBannerMessage(`Debug Mode: ${newMode ? "ON" : "OFF"}`);
                                        setShowDebugBanner(true);
                                        setTimeout(() => setShowDebugBanner(false), 2500);
                                    }}
                                    className="w-full h-full"
                                />
                            </View>
                        </View>

                        {/* Middle: Visualizer */}
                        <View 
                            className="shadow-lg shadow-black/50"
                            style={{ flex: 3.5 }}
                        >
                            <View className="flex-1 rounded-[32px] overflow-hidden">
                                <Visualizer 
                                    magnitude={currentMagnitude} 
                                    isActive={status === 'BREWING'} 
                                    className="w-full h-full" 
                                />
                            </View>
                        </View>

                        {/* Bottom: Row for Stats */}
                        <View 
                            className="flex-row gap-3"
                            style={{ flex: 2 }}
                        >
                            <View className="flex-1 shadow-lg shadow-black/50">
                                <View className="flex-1 rounded-[32px] overflow-hidden">
                                    <StatCard 
                                        label={i18n.t('lastShot')} 
                                        value={lastShotTime ? formatTimeSimple(lastShotTime) : '--'} 
                                        className="flex-1"
                                    />
                                </View>
                            </View>
                            <View className="flex-1 shadow-lg shadow-black/50">
                                <View className="flex-1 rounded-[32px] overflow-hidden">
                                    <CalibrationCard 
                                        onPress={calibrate}
                                        isCalibrating={isCalibrating}
                                        className="flex-1"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                )}


            </View>
            </View>

            {/* Debug Toast Banner - Absolute Top Center */}
            {showDebugBanner && (
                <View className="absolute top-12 left-0 right-0 items-center z-50 pointer-events-none">
                    <View className="bg-black/80 border border-white/10 px-6 py-3 rounded-full flex-row items-center gap-2 shadow-xl shadow-black">
                        <View className={`w-2 h-2 rounded-full ${debugBannerMessage.includes("ON") || debugBannerMessage.includes("AN") ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                        <Text className="text-white font-medium tracking-wide text-sm">
                            {debugBannerMessage}
                        </Text>
                    </View>
                </View>
            )}

            {/* Debug: Reset Onboarding Button */}
            {debugMode && (
                <View className="absolute bottom-8 left-0 right-0 items-center z-50">
                    <TouchableOpacity 
                        onPress={async () => {
                            await storage.resetOnboarding();
                            setShowOnboarding(true);
                            setDebugBannerMessage("Onboarding Reset");
                            setShowDebugBanner(true);
                            setTimeout(() => setShowDebugBanner(false), 2000);
                        }}
                        className="bg-red-500/20 border border-red-500/50 px-4 py-2 rounded-full"
                    >
                        <Text className="text-red-400 font-medium text-xs uppercase tracking-wider">
                            {i18n.t('resetOnboarding')}
                        </Text>
                    </TouchableOpacity>
                    <Text className="text-white/30 text-[10px] mt-2 font-mono">
                        Supporter: {isSupporter ? "YES" : "NO"}
                    </Text>
                </View>
            )}

        </SafeAreaView>
        </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
