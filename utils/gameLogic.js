/**
 * Berechnet die verdienten Herzen basierend auf dem Werkzeug und der Distanz.
 * Inklusive Anti-Cheat: Distanzen < 50m (0.05km) geben nur 0.5x Punkte.
 */
export const calculateEarnedHearts = (activeTool, distance, basePointsMap, thresholds) => {
  const basePoints = basePointsMap[activeTool] || 0;
  
  // Anti-Cheat: Wenn zu nah am Heimatort (< 50m)
  if (distance < 0.05) {
    return {
      earnedHearts: Math.floor(basePoints * 0.5),
      multiplier: 0.5,
      isAtHome: true
    };
  }

  // Suche den passenden Multiplikator (Standard-Logik)
  let multiplier = 1;
  const thresholdMatch = thresholds.find(t => distance >= t.minKm);
  if (thresholdMatch) {
    multiplier = thresholdMatch.multiplier;
  }

  return {
    earnedHearts: basePoints * multiplier,
    multiplier,
    isAtHome: false
  };
};