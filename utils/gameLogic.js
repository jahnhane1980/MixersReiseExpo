import { Config } from '../constants/Config';

/**
 * Berechnet die verdienten Herzen basierend auf Tool, Distanz und REAKTIONSZEIT.
 */
export const calculateEarnedHearts = (activeTool, distance, basePointsMap, thresholds, activeNeed) => {
  const basePoints = basePointsMap[activeTool] || 0;
  let timeFactor = 1.0;
  let isPenalty = false;

  // 1. Zeitliche Abwertung berechnen
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

  // 2. Distanz-Multiplikator suchen
  let distMultiplier = 1;
  const thresholdMatch = thresholds.find(t => distance >= t.minKm);
  if (thresholdMatch) {
    distMultiplier = thresholdMatch.multiplier;
  }

  // 3. Anti-Cheat: Heimatort-Malus (50% Punkte)
  let finalMultiplier = distMultiplier;
  let isAtHome = false;
  if (distance < 0.05) {
    finalMultiplier = 0.5;
    isAtHome = true;
  }

  // 4. Berechnung mit Absicherung gegen 0-Punkte-Hänger
  let earnedHearts = Math.floor(basePoints * finalMultiplier * timeFactor);

  // KORREKTUR: Wenn es kein Penalty ist, aber die Rundung 0 ergibt, gib mindestens 1 Herz.
  if (!isPenalty && earnedHearts === 0 && basePoints > 0) {
    earnedHearts = 1;
  }

  return {
    earnedHearts,
    multiplier: finalMultiplier,
    timeFactor: timeFactor,
    isAtHome,
    isPenalty
  };
};