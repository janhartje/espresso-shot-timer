import { useState, useEffect, useRef, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ShotStatus = 'IDLE' | 'BREWING' | 'FINISHED';

interface UseShotTimerProps {
  threshold?: number; 
  startDelay?: number; 
  stopDelay?: number; 
  smoothingBufferSize?: number; 
}

export const useShotTimer = ({
  threshold = 1.1, 
  startDelay = 400,
  stopDelay = 1000, 
  smoothingBufferSize = 50, 
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
  const ignoreSensorsUntilRef = useRef<number>(0); // Cooldown to prevent touch vibrations triggering timer
  
  // Calibration
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationTimeLeft, setCalibrationTimeLeft] = useState(0);
  const [calibrationFinished, setCalibrationFinished] = useState(false);

  // Variance-Based Logic
  const [currentDeviation, setCurrentDeviation] = useState(0); 
  const [activeVibrationLevel, setActiveVibrationLevel] = useState(0.05); 
  const [sensitivityLevel, setSensitivityLevel] = useState<SensitivityLevel>('HIGH');

  // Sensitivity helper
  const getSensitivityMultiplier = (level: SensitivityLevel) => {
    switch(level) {
        case 'HIGH': return 0.2; 
        case 'MEDIUM': return 0.5; 
        case 'LOW': return 0.8; 
    }
  };

  const currentThreshold = activeVibrationLevel * getSensitivityMultiplier(sensitivityLevel);

  const startTimer = useCallback(() => {
    setStatus('BREWING');
    startTimeRef.current = Date.now();
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current as NodeJS.Timeout);
    
    timerIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          setElapsedTime(now - (startTimeRef.current as number));
        }
    }, 100); 
  }, []);

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
      
      // Batch updates are automatic in React 18, but explicit ordering helps clarity
      setElapsedTime(finalTime);
      setLastShotTime(finalTime);
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

  // Calibration functions
  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setCalibrationFinished(false);
    setCalibrationTimeLeft(3); 
  }, []);

  const stopCalibration = useCallback(() => {
    setIsCalibrating(false);
    setCalibrationTimeLeft(0);
  }, []);

  const finishCalibration = useCallback((buffer: number[]) => {
      if (buffer.length === 0) {
          stopCalibration();
          return;
      }
      
      const sum = buffer.reduce((a, b) => a + b, 0);
      const avgSD = sum / buffer.length;
      
      const safeActiveLevel = Math.max(0.01, avgSD);
      
      setActiveVibrationLevel(safeActiveLevel);
      setSensitivityLevel('MEDIUM'); 
      
      setCalibrationFinished(true);
      setTimeout(() => {
          setIsCalibrating(false);
          setCalibrationFinished(false);
      }, 3000);
  }, [stopCalibration]);

  const calibrationCallbackRef = useRef<((val: number) => void) | null>(null);

  // Calibration effect
  useEffect(() => {
    if (!isCalibrating || calibrationFinished) {
        calibrationCallbackRef.current = null;
        return;
    }

    const buffer: number[] = [];
    
    calibrationCallbackRef.current = (sd: number) => {
        buffer.push(sd);
    };

    const interval = setInterval(() => {
        setCalibrationTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(interval);
                finishCalibration(buffer);
                return 0; 
            }
            return prev - 1;
        });
    }, 1000);

    return () => {
        clearInterval(interval);
        calibrationCallbackRef.current = null;
    };
  }, [isCalibrating, calibrationFinished, finishCalibration]);

  const thresholdRef = useRef(currentThreshold);
  useEffect(() => {
      thresholdRef.current = currentThreshold;
  }, [currentThreshold]);

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, [currentThreshold]); 

  // Helper for SD
  const calculateSD = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const sqDiffs = arr.map(v => Math.pow(v - mean, 2));
      const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(avgSqDiff);
  };

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
      
      setCurrentMagnitude(magnitude); 
      setCurrentDeviation(stdDev);

      if (calibrationCallbackRef.current) {
        calibrationCallbackRef.current(stdDev);
        return;
      }

      const now = Date.now();
      
      // Ignore sensors if we are in a "cooldown" phase (e.g. just pressed stop)
      if (now < ignoreSensorsUntilRef.current) {
          lastAboveThresholdTimeRef.current = null; // Reset triggers
          return;
      }

      const currentStatus = statusRef.current; 

      // DEBUG: Throttle logs to avoid spamming
      if (Math.random() < 0.05) {
          console.log(`[Sensor] Mag: ${magnitude.toFixed(3)} | Dev: ${stdDev.toFixed(3)} | Thresh: ${thresholdRef.current.toFixed(3)} | State: ${currentStatus}`);
      }

      if (currentStatus === 'IDLE' || currentStatus === 'FINISHED') {
        const isStartTrigger = stdDev > thresholdRef.current;

        if (isStartTrigger) {
            console.log(`[Trigger] Start conditions met. Mag: ${magnitude.toFixed(3)}`);
            if (!lastAboveThresholdTimeRef.current) {
                lastAboveThresholdTimeRef.current = now;
            } else if (now - lastAboveThresholdTimeRef.current > startDelay) {
                console.log(`[Action] STARTING TIMER`);
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
                console.log(`[Action] STOPPING TIMER`);
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
    currentMagnitude,
    currentDeviation, // Expose for UI
    lastShotTime,
    startTimer,    
    stopTimer,     
    resetTimer,    
    calibrate: startCalibration, 
    cancelCalibration: stopCalibration,
    isCalibrating,
    calibrationTimeLeft,
    calibrationFinished,
    baseline: activeVibrationLevel, // expose active level as baseline
    threshold: currentThreshold,
    sensitivityLevel,
    setSensitivityLevel
  };
};
