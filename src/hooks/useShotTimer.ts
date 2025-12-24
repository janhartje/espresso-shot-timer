import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { storage } from '../utils/storage';
import { useCalibration } from './useCalibration';
import { calculateSD, getSensitivityMultiplier, SensitivityLevel } from '../utils/math';
import { DebugLogger } from '../utils/logger';

export { SensitivityLevel }; // Re-export for components that use it
export type ShotStatus = 'IDLE' | 'BREWING' | 'FINISHED';

interface UseShotTimerProps {
  threshold?: number; 
  startDelay?: number; 
  stopDelay?: number; 
  smoothingBufferSize?: number; 
  ignoreSensors?: boolean;
}

export const useShotTimer = ({
  threshold = 1.1, 
  startDelay = 400,
  stopDelay = 200, 
  smoothingBufferSize = 50, 
  ignoreSensors = false,
}: UseShotTimerProps = {}) => {
  const [status, setStatus] = useState<ShotStatus>('IDLE');
  const statusRef = useRef<ShotStatus>('IDLE'); 

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const [elapsedTime, setElapsedTime] = useState(0); 
  const [currentMagnitude, setCurrentMagnitude] = useState(1); 
  const [lastShotTime, setLastShotTime] = useState<number | null>(null);

  const bufferRef = useRef<number[]>([]);
  const lastAboveThresholdTimeRef = useRef<number | null>(null);
  const lastBelowThresholdTimeRef = useRef<number | null>(null);
  const brewingMaxStdDevRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const subscriptionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const ignoreSensorsUntilRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);
  
  // Variance-Based Logic
  // Variance-Based Logic
  const [currentDeviation, setCurrentDeviation] = useState(0); 
  const [activeVibrationLevel, setActiveVibrationLevel] = useState(0.05); 
  const [sensitivityLevel, setSensitivityLevel] = useState<SensitivityLevel>(10);
  const [hysteresisLevel, setHysteresisLevel] = useState(75);
  const [preInfusionDelay, setPreInfusionDelay] = useState(0);
  
  // Debug Mode
  const [debugMode, setDebugMode] = useState(false);
  const debugModeRef = useRef(false);
  
  // Load persisted state
  const [areSettingsLoaded, setAreSettingsLoaded] = useState(false);
  useEffect(() => {
      const loadState = async () => {
          try {
              const savedDebug = await storage.getDebugMode();
              setDebugMode(savedDebug);

              const savedLastShot = await storage.getLastShotTime();
              if (savedLastShot !== null) {
                  setLastShotTime(savedLastShot);
              }

              const savedBaseline = await storage.getCalibrationBaseline();
              if (savedBaseline !== null) {
                  setActiveVibrationLevel(savedBaseline);
              }

              const savedSensitivity = await storage.getCalibrationSensitivity();
              if (savedSensitivity !== null) {
                  // MIGRATION LOGIC:
                  // Check if it's a legacy string ('HIGH', 'MEDIUM', 'LOW')
                  if (savedSensitivity === 'HIGH') {
                      setSensitivityLevel(17);
                      storage.setCalibrationSensitivity(17);
                  } else if (savedSensitivity === 'MEDIUM') {
                      setSensitivityLevel(10);
                      storage.setCalibrationSensitivity(10);
                  } else if (savedSensitivity === 'LOW') {
                      setSensitivityLevel(4);
                      storage.setCalibrationSensitivity(4);
                  } else {
                      // It should be a number (stringified)
                      const numericSensitivity = Number(savedSensitivity);
                      if (!isNaN(numericSensitivity)) {
                          setSensitivityLevel(numericSensitivity);
                      } else {
                          // Fallback
                          setSensitivityLevel(10);
                      }
                  }
              }

              const savedHysteresis = await storage.getHysteresisLevel();
              setHysteresisLevel(savedHysteresis);

              const savedPreInfusion = await storage.getPreInfusionDelay();
              setPreInfusionDelay(savedPreInfusion);
          } catch (e) {
              logger.error('[Timer] Failed to load persisted state', e);
          } finally {
              setAreSettingsLoaded(true);
          }
      };
      loadState();
  }, []);

  useEffect(() => {
      debugModeRef.current = debugMode;
  }, [debugMode]);

  const toggleDebugMode = useCallback(async () => {
      setDebugMode(prev => {
          const newState = !prev;
          storage.setDebugMode(newState).catch(e => logger.error('[Timer] Failed to save debug mode', e));
          return newState;
      });
  }, []);

  // Initialize Logger
  const loggerRef = useRef(new DebugLogger(debugModeRef));
  const logger = loggerRef.current;



  const currentThreshold = activeVibrationLevel * getSensitivityMultiplier(sensitivityLevel);

  // Calibration Hook
  const { 
      isCalibrating, 
      calibrationTimeLeft, 
      calibrationFinished, 
      startCalibration, 
      stopCalibration,
      calibrationBuffer
  } = useCalibration({
      logger,
      ignoreSensorsRef: ignoreSensorsUntilRef,
      onCalibrationComplete: (newLevel, newSensitivity) => {
          setActiveVibrationLevel(newLevel);
          setSensitivityLevel(newSensitivity);
          storage.setCalibrationBaseline(newLevel).catch(e => logger.error('[Timer] Failed to save calibration baseline', e));
          storage.setCalibrationSensitivity(newSensitivity).catch(e => logger.error('[Timer] Failed to save calibration sensitivty', e));
      }
  });


  const startTimer = useCallback(() => {
    logger.log('[Timer] Starting timer...');
    setStatus('BREWING');
    startTimeRef.current = Date.now();
    
    // Clear any existing interval just in case
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current as NodeJS.Timeout);
    timerIntervalRef.current = null;
  }, [logger]);

  const stopTimer = useCallback((endTimeOverride?: number) => {
    // Only stop if we are actually BREWING to avoid duplicate calls/resets
    if (statusRef.current !== 'BREWING') return;

    setStatus('FINISHED');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current as NodeJS.Timeout);
    timerIntervalRef.current = null;
    
    // Ignore sensor input for 2 seconds
    ignoreSensorsUntilRef.current = Date.now() + 2000;
    
    if (startTimeRef.current) {
      const endTime = (typeof endTimeOverride === 'number') ? endTimeOverride : Date.now();
      const finalTime = Math.max(0, endTime - startTimeRef.current);
      
      setElapsedTime(finalTime);
      setLastShotTime(finalTime);
      storage.setLastShotTime(finalTime).catch(e => logger.error('[Timer] Failed to save last shot', e));
    }
  }, []);

  const resetTimer = useCallback(() => {
    setStatus('IDLE');
    setElapsedTime(0);
    startTimeRef.current = null;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current as NodeJS.Timeout);
    timerIntervalRef.current = null;
    
    ignoreSensorsUntilRef.current = Date.now() + 1000; 
  }, []);

  const thresholdRef = useRef(currentThreshold);
  useEffect(() => {
      thresholdRef.current = currentThreshold;
  }, [currentThreshold]);

  useEffect(() => {
    if (!ignoreSensors) {
        _subscribe();
    }
    return () => _unsubscribe();
    return () => _unsubscribe();
  }, [currentThreshold, isCalibrating, ignoreSensors, hysteresisLevel, preInfusionDelay]); 

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(20); 

    subscriptionRef.current = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      
      const buffer = bufferRef.current;
      buffer.push(magnitude);
      if (buffer.length > smoothingBufferSize) {
        buffer.shift();
      }
      
      const stdDev = calculateSD(buffer);
      
      // OPTIMIZATION: Handle calibration first to avoid unnecessary UI updates
      if (isCalibrating) {
        calibrationBuffer.current.push(stdDev);
        return;
      }
      
      const now = Date.now();
      
      // Throttle UI updates to ~15fps (66ms)
      if (now - lastUiUpdateRef.current > 66) {
          setCurrentMagnitude(magnitude); 
          setCurrentDeviation(stdDev);
          lastUiUpdateRef.current = now;
      }

      if (now < ignoreSensorsUntilRef.current) {
          lastAboveThresholdTimeRef.current = null; // Reset triggers
          return;
      }

      const currentStatus = statusRef.current; 

      if (debugModeRef.current) {
        if (Math.random() < 0.05) {
            logger.log(`[Sensor] Mag: ${magnitude.toFixed(3)} | Dev: ${stdDev.toFixed(3)} | Thresh: ${thresholdRef.current.toFixed(3)} | State: ${currentStatus}`);
        }
      }

      if (currentStatus === 'IDLE' || currentStatus === 'FINISHED') {
        const isStartTrigger = stdDev > thresholdRef.current;

        if (isStartTrigger) {
            logger.log(`[Trigger] Start conditions met. Mag: ${magnitude.toFixed(3)}`);
            if (!lastAboveThresholdTimeRef.current) {
                lastAboveThresholdTimeRef.current = now;
            } else if (now - lastAboveThresholdTimeRef.current > startDelay) {
                logger.log(`[Action] STARTING TIMER`); 
                if (currentStatus === 'FINISHED') resetTimer();
                
                // Reset adaptive tracking on start
                brewingMaxStdDevRef.current = thresholdRef.current;
                
                startTimer();
                lastAboveThresholdTimeRef.current = null; 
            }
        } else {
            lastAboveThresholdTimeRef.current = null;
        }
      } else if (currentStatus === 'BREWING') {
        const timeActive = now - (startTimeRef.current || now);
        // Use user-configured preInfusionDelay
        const gracePeriod = preInfusionDelay; 

        // 1. Grace Period: Always keep active
        if (timeActive < gracePeriod) {
            lastBelowThresholdTimeRef.current = null;
            return;
        }

        // 2. Adaptive Tracking: Track max vibration AFTER grace period
        // This ensures we only learn the "main phase" vibration
        if (stdDev > brewingMaxStdDevRef.current) {
            brewingMaxStdDevRef.current = stdDev;
        }

        // 3. Stop Condition: Use dynamic max as reference
        // Hysteresis: Keep active > hysteresis% of dynamic max (or at least original threshold)
        const referenceLevel = Math.max(thresholdRef.current, brewingMaxStdDevRef.current);
        const isStillActive = stdDev > (referenceLevel * (hysteresisLevel / 100));

        if (!isStillActive) {
            if (!lastBelowThresholdTimeRef.current) {
                lastBelowThresholdTimeRef.current = now;
            } else if (now - lastBelowThresholdTimeRef.current > stopDelay) {
                logger.log(`[Action] STOPPING TIMER (Adaptive)`); 
                stopTimer(lastBelowThresholdTimeRef.current);
                lastBelowThresholdTimeRef.current = null; 
            }
        } else {
            lastBelowThresholdTimeRef.current = null; 
        }
      }
    });
  };

  const _unsubscribe = () => {
    subscriptionRef.current && subscriptionRef.current.remove();
    subscriptionRef.current = null;
  };

  // AppState Handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
            logger.log('[AppState] App going to background/inactive. Stopping sensors.');
            _unsubscribe();
            
            if (statusRef.current === 'BREWING') {
                logger.log('[AppState] Timer was running. Stopping due to background.');
                stopTimer();
            }
        } else if (nextAppState === 'active') {
            logger.log('[AppState] App coming to foreground. Resuming sensors.');
            if (!ignoreSensors && !subscriptionRef.current) {
                _subscribe();
            }
        }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
        subscription.remove();
    };
  }, [ignoreSensors, stopTimer, logger]);

  const setSensitivity = useCallback((level: SensitivityLevel) => {
      setSensitivityLevel(level);
      storage.setCalibrationSensitivity(level).catch(e => logger.error('[Timer] Failed to save sensitivity', e));
  }, []);

  return {
    status,
    elapsedTime,
    startTime: startTimeRef.current,
    currentMagnitude,
    currentDeviation, 
    lastShotTime,
    startTimer,    
    stopTimer,     
    resetTimer,    
    calibrate: startCalibration, 
    cancelCalibration: stopCalibration,
    isCalibrating,
    calibrationTimeLeft,
    calibrationFinished,
    baseline: activeVibrationLevel, 
    threshold: currentThreshold,
    sensitivityLevel,
    setSensitivityLevel: setSensitivity,
    debugMode,
    toggleDebugMode,
    areSettingsLoaded,
    setHysteresis: (val: number) => {
        setHysteresisLevel(val);
        storage.setHysteresisLevel(val);
    },
    hysteresisLevel,
    setPreInfusionDelay: (val: number) => {
        setPreInfusionDelay(val);
        storage.setPreInfusionDelay(val);
    },
    preInfusionDelay,
    logger
  };
};
