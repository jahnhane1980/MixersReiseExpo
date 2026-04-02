import { Config } from '../constants/Config';

/**
 * Berechnet die verdienten Herzen basierend auf Tool, Distanz, REAKTIONSZEIT und GENAUIGKEIT.
 * @param {number} activeTool - ID des verwendeten Tools
 * @param {number} distance - Aktuelle Distanz zum Heimatort
 * @param {object} basePointsMap - Map der Basispunkte
 * @param {array} thresholds - Distanz-Multiplikatoren
 * @param {object} activeNeed - Das aktuelle Bedürfnis { toolId, timestamp }
 * @param {number} accuracy - Aktuelle GPS-Genauigkeit in Metern
 */
export const calculateEarnedHearts = (activeTool, distance, basePointsMap, thresholds, activeNeed, accuracy = 0) => {
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

  // 2. KORREKTUR Anti-Cheat: Nur bestrafen, wenn wir SICHER zu Hause sind.
  // Wenn die Ungenauigkeit (accuracy) größer als 50m ist, ignorieren wir den Malus.
  const isActuallyAtHome = distance < 0.05 && accuracy < 50;

  if (isActuallyAtHome) {
    let hearts = Math.floor(basePoints * 0.5 * timeFactor);
    // Sicherstellen, dass bei Erfolg (kein Penalty) immer mind. 1 Punkt vergeben wird
    if (!isPenalty && hearts === 0 && basePoints > 0) hearts = 1;
    
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

  let finalHearts = Math.floor(basePoints * distMultiplier * timeFactor);
  if (!isPenalty && finalHearts === 0 && basePoints > 0) finalHearts = 1;

  return {
    earnedHearts: finalHearts,
    multiplier: distMultiplier,
    timeFactor: timeFactor,
    isAtHome: false,
    isPenalty
  };
};