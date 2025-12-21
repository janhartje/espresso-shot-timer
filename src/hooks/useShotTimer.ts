import { useState, useEffect, useRef, useCallback } from 'react';
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
  const startTimeRef = useRef<number | null>(null);
  const subscriptionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const ignoreSensorsUntilRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);
  
  // Variance-Based Logic
  const [currentDeviation, setCurrentDeviation] = useState(0); 
  const [activeVibrationLevel, setActiveVibrationLevel] = useState(0.05); 
  const [sensitivityLevel, setSensitivityLevel] = useState<SensitivityLevel>('HIGH');
  
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
                  setSensitivityLevel(savedSensitivity as SensitivityLevel);
              }
          } catch (e) {
              console.error('Failed to load persisted state', e);
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
          storage.setDebugMode(newState).catch(e => console.error(e));
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
          storage.setCalibrationBaseline(newLevel).catch(e => console.error(e));
          storage.setCalibrationSensitivity(newSensitivity).catch(e => console.error(e));
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
      storage.setLastShotTime(finalTime).catch(e => console.error('Failed to save last shot', e));
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
  }, [currentThreshold, isCalibrating, ignoreSensors]); 

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
            console.log(`[Sensor] Mag: ${magnitude.toFixed(3)} | Dev: ${stdDev.toFixed(3)} | Thresh: ${thresholdRef.current.toFixed(3)} | State: ${currentStatus}`);
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
                startTimer();
                lastAboveThresholdTimeRef.current = null; 
            }
        } else {
            lastAboveThresholdTimeRef.current = null;
        }
      } else if (currentStatus === 'BREWING') {
        // Hysteresis: Keep active > 60% of trigger
        const isStillActive = stdDev > (thresholdRef.current * 0.6);

        if (!isStillActive) {
            if (!lastBelowThresholdTimeRef.current) {
                lastBelowThresholdTimeRef.current = now;
            } else if (now - lastBelowThresholdTimeRef.current > stopDelay) {
                logger.log(`[Action] STOPPING TIMER`); 
                // Pass the time when vibration ACTUALLY started dropping below threshold
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
    setSensitivityLevel,
    debugMode,
    toggleDebugMode,
    areSettingsLoaded
  };
};
