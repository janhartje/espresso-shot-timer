export type SensitivityLevel = number;

export const getSensitivityMultiplier = (level: SensitivityLevel) => {
    // Map 1-20 to a reasonable multiplier range
    // Level 1 = Low Sensitivity (Multiplier 1.5)
    // Level 10 = Standard (Multiplier 0.5)
    // Level 20 = High Sensitivity (Multiplier 0.05)
    
    // Linear mapping or exponential?
    // Let's try mapping: 1 -> 1.5, 20 -> 0.05
    const minMult = 0.05;
    const maxMult = 1.5;
    const minLevel = 1;
    const maxLevel = 20;

    // Inverse relationship: High level = Low Multiplier
    const ratio = (level - minLevel) / (maxLevel - minLevel);
    return maxMult - (ratio * (maxMult - minMult));
};

export const calculateSD = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const sqDiffs = arr.map(v => Math.pow(v - mean, 2));
    const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(avgSqDiff);
};
