/**
 * Berechnet die verdienten Herzen basierend auf dem Werkzeug und der Distanz.
 * @param {number} activeTool - Die ID des gewählten Werkzeugs
 * @param {number} distance - Die berechnete Distanz zum Heimatort
 * @param {object} basePointsMap - Die TOOL_BASE_POINTS aus GameRules
 * @param {array} thresholds - Die DISTANCE_THRESHOLDS aus GameRules
 * @returns {object} Ein Objekt mit earnedHearts und dem angewendeten multiplier
 */
export const calculateEarnedHearts = (activeTool, distance, basePointsMap, thresholds) => {
  const basePoints = basePointsMap[activeTool] || 0;

  // Suche den passenden Multiplikator (erstes Match in der sortierten Liste)
  let multiplier = 1;
  const thresholdMatch = thresholds.find(t => distance >= t.minKm);
  if (thresholdMatch) {
    multiplier = thresholdMatch.multiplier;
  }

  return {
    earnedHearts: basePoints * multiplier,
    multiplier
  };
};