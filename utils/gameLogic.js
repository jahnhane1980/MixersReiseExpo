import { Config } from '../constants/Config';

/**
 * Berechnet die verdienten Herzen basierend auf Tool, Distanz und REAKTIONSZEIT.
 * @param {number} activeTool - ID des verwendeten Tools
 * @param {number} distance - Aktuelle Distanz zum Heimatort
 * @param {object} basePointsMap - Map der Basispunkte
 * @param {array} thresholds - Distanz-Multiplikatoren
 * @param {object} activeNeed - Das aktuelle Bedürfnis { toolId, timestamp }
 */
export const calculateEarnedHearts = (activeTool, distance, basePointsMap, thresholds, activeNeed) => {
  const basePoints = basePointsMap[activeTool] || 0;
  let timeFactor = 1.0;
  let isPenalty = false;

  // 1. Zeitliche Abwertung berechnen, falls ein Bedarf existiert
  if (activeNeed && activeNeed.timestamp) {
    const elapsed = Date.now() - activeNeed.timestamp;
    const { FULL_POINTS_UNTIL, DECAY_UNTIL, PENALTY_AFTER, MIN_MULTIPLIER } = Config.NEED_CONFIG;

    if (elapsed > PENALTY_AFTER) {
      // Strafe: Negativer Wert (Abzug der Basispunkte)
      isPenalty = true;
      timeFactor = -1.0; 
    } else if (elapsed > FULL_POINTS_UNTIL) {
      // Linearer Verfall zwischen 5 und 30 Minuten
      const decayRange = DECAY_UNTIL - FULL_POINTS_UNTIL;
      const elapsedInDecay = elapsed - FULL_POINTS_UNTIL;
      const decayProgress = Math.min(elapsedInDecay / decayRange, 1.0);
      
      // Faktor sinkt von 1.0 auf MIN_MULTIPLIER (z.B. 0.2)
      timeFactor = 1.0 - (decayProgress * (1.0 - MIN_MULTIPLIER));
    }
  }

  // 2. Anti-Cheat: Wenn zu nah am Heimatort (< 50m)
  if (distance < 0.05) {
    const hearts = Math.floor(basePoints * 0.5 * timeFactor);
    return {
      earnedHearts: hearts,
      multiplier: 0.5,
      timeFactor: timeFactor,
      isAtHome: true,
      isPenalty
    };
  }

  // 3. Distanz-Multiplikator suchen
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