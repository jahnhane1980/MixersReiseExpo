import { Config } from '../constants/Config';

export const calculateEarnedHearts = (activeTool, distance, basePointsMap, thresholds, activeNeed, accuracy = 0) => {
  const basePoints = basePointsMap[activeTool] || 0;
  let timeFactor = 1.0;
  let isPenalty = false;

  // 1. Zeitliche Abwertung (unverändert)
  if (activeNeed && activeNeed.timestamp) {
    const elapsed = Date.now() - activeNeed.timestamp;
    const { FULL_POINTS_UNTIL, DECAY_UNTIL, PENALTY_AFTER, MIN_MULTIPLIER } = Config.NEED_CONFIG;

    if (elapsed > PENALTY_AFTER) {
      isPenalty = true;
      timeFactor = -1.0; 
    } else if (elapsed > FULL_POINTS_UNTIL) {
      const decayRange = DECAY_UNTIL - FULL_POINTS_UNTIL;
      const elapsedInDecay = elapsed - FULL_POINTS_UNTIL;
      const decayProgress = Math.min(elapsedInDecay / decayRange, 1.0);
      timeFactor = 1.0 - (decayProgress * (1.0 - MIN_MULTIPLIER));
    }
  }

  // 2. KORREKTUR: Anti-Cheat mit Genauigkeits-Check
  // Nur bestrafen, wenn wir uns der Position sicher sind (accuracy < 50)
  const isActuallyAtHome = distance < 0.05 && accuracy < 50;

  if (isActuallyAtHome) {
    const hearts = Math.floor(basePoints * 0.5 * timeFactor);
    return {
      earnedHearts: hearts,
      multiplier: 0.5,
      timeFactor: timeFactor,
      isAtHome: true,
      isPenalty
    };
  }

  // 3. Distanz-Multiplikator (unverändert)
  let distMultiplier = 1;
  const thresholdMatch = thresholds.find(t => distance >= t.minKm);
  if (thresholdMatch) {
    distMultiplier = thresholdMatch.multiplier;
  }

  const finalHearts = Math.floor(basePoints * distMultiplier * timeFactor);

  return {
    earnedHearts: finalHearts,
    multiplier: distMultiplier,
    timeFactor: timeFactor,
    isAtHome: false,
    isPenalty
  };
};