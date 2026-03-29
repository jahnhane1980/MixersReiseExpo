export const GameRules = {
  // Basis-Punkte für jedes Werkzeug
  TOOL_BASE_POINTS: {
    1: 5,  // Essen
    2: 10, // Trinken
    3: 10, // Streicheln
    4: 15, // Schwamm
    5: 20  // Sprechblase
  },
  
  // Distanz-Schwellenwerte in Kilometern und ihre Multiplikatoren.
  // Wichtig für die Logik: Muss absteigend sortiert bleiben!
  DISTANCE_THRESHOLDS: [
    { minKm: 750, multiplier: 10 },
    { minKm: 500, multiplier: 5 },
    { minKm: 250, multiplier: 2 },
    { minKm: 0, multiplier: 1 } // Fallback für Heimatort
  ]
};