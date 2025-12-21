export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export const getSensitivityMultiplier = (level: SensitivityLevel) => {
    switch(level) {
        case 'HIGH': return 0.2; 
        case 'MEDIUM': return 0.5; 
        case 'LOW': return 0.8; 
    }
};

export const calculateSD = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const sqDiffs = arr.map(v => Math.pow(v - mean, 2));
    const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(avgSqDiff);
};
