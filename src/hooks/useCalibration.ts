import { useState, useRef, useCallback, useEffect } from 'react';
import { calculateSD } from '../utils/math';
import { DebugLogger } from '../utils/logger';
import { SensitivityLevel, getSensitivityMultiplier } from '../utils/math';

interface UseCalibrationProps {
    logger: DebugLogger;
    onCalibrationComplete: (newLevel: number, sensitivity: SensitivityLevel) => void;
    ignoreSensorsRef: React.MutableRefObject<number>;
}

export const useCalibration = ({ logger, onCalibrationComplete, ignoreSensorsRef }: UseCalibrationProps) => {
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationTimeLeft, setCalibrationTimeLeft] = useState(0);
    const [calibrationFinished, setCalibrationFinished] = useState(false);
    
    // Internal Refs
    const calibrationBufferRef = useRef<number[]>([]);
    const calibrationStartTimeRef = useRef<number>(0);
    const calibrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const uiResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);



    const startCalibration = useCallback(() => {
        logger.log('[Calibration] startCalibration called via UI');

        if (calibrationTimeoutRef.current) {
            logger.log('[Calibration] Clearing old calibrationTimeout');
            clearTimeout(calibrationTimeoutRef.current);
            calibrationTimeoutRef.current = null;
        }
        if (uiResetTimeoutRef.current) {
            logger.log('[Calibration] Clearing old uiResetTimeout');
            clearTimeout(uiResetTimeoutRef.current);
            uiResetTimeoutRef.current = null;
        }

        setIsCalibrating(true);
        setCalibrationFinished(false);
        setCalibrationTimeLeft(5);
        calibrationBufferRef.current = [];
        
        // Block sensors immediately
        ignoreSensorsRef.current = Infinity; 
        
        calibrationStartTimeRef.current = Date.now();
        logger.log(`[Calibration] Start Time set to: ${calibrationStartTimeRef.current}`);
        
        // Set a hard timer to finish calibration
        calibrationTimeoutRef.current = setTimeout(() => {
            logger.log('[Calibration] 5s Timeout fired -> calling finishCalibration');
            finishCalibration();
        }, 5000);

    }, [logger]);

    const stopCalibration = useCallback(() => {
        logger.log('[Calibration] stopCalibration called');
        if (calibrationTimeoutRef.current) {
            clearTimeout(calibrationTimeoutRef.current);
            calibrationTimeoutRef.current = null;
        }
        if (uiResetTimeoutRef.current) {
            clearTimeout(uiResetTimeoutRef.current);
            uiResetTimeoutRef.current = null;
        }
        setIsCalibrating(false);
        setCalibrationTimeLeft(0);
        // Release sensor block with a small delay
        ignoreSensorsRef.current = Date.now() + 1000;
    }, [logger]);

    const finishCalibration = useCallback(() => {
        logger.log('[Calibration] finishCalibration called');
        try {
            const buffer = calibrationBufferRef.current;
            
            if (buffer.length === 0) {
                logger.log('[Calibration] No data collected (Buffer empty). Aborting.');
                stopCalibration();
                return;
            }
            
            // Use util
            // Calculate average of the collected SD samples
            const sum = buffer.reduce((a, b) => a + b, 0);
            const calculatedAvgSD = sum / buffer.length;

            const safeActiveLevel = Math.max(0.01, calculatedAvgSD);
            
            const multiplier = getSensitivityMultiplier(10);
            const resultingThreshold = safeActiveLevel * multiplier;
            
            logger.log(`[Calibration] Finished. Processed ${buffer.length} samples.`);
            logger.log(`[Calibration] Baseline (Avg SD): ${safeActiveLevel.toFixed(4)}`);
            logger.log(`[Calibration] New Threshold: ${resultingThreshold.toFixed(4)}`);

            setCalibrationFinished(true);
            
            // Callback to parent to set the actual app state
            // Set to Level 12 (approx old Medium/Standard)
            onCalibrationComplete(safeActiveLevel, 12);

            if (uiResetTimeoutRef.current) clearTimeout(uiResetTimeoutRef.current);
            uiResetTimeoutRef.current = setTimeout(() => {
                logger.log('[Calibration] UI Reset Timeout fired -> restoring state');
                setIsCalibrating(false);
                setCalibrationFinished(false);
            }, 3000);

        } catch (e) {
            console.error("[Calibration] Error in finishCalibration:", e);
            stopCalibration();
        } finally {
            ignoreSensorsRef.current = Date.now() + 2000;
            logger.log('[Calibration] Sensor lock released (with cooldown).');
        }
    }, [stopCalibration, onCalibrationComplete, logger]);

    // Timer Effect
    useEffect(() => {
        if (!isCalibrating || calibrationFinished) {
            return;
        }
        const interval = setInterval(() => {
            const elapsed = Date.now() - calibrationStartTimeRef.current;
            const remaining = Math.max(0, Math.ceil((5000 - elapsed) / 1000));
            setCalibrationTimeLeft(remaining);
        }, 100);

        return () => clearInterval(interval);
    }, [isCalibrating, calibrationFinished]);

    return {
        isCalibrating,
        calibrationTimeLeft,
        calibrationFinished,
        startCalibration,
        stopCalibration,
        calibrationBuffer: calibrationBufferRef, // Expose ref so parent can push data
    };
};
