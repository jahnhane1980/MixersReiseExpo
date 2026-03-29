import { calculateEarnedHearts } from './gameLogic';
import { GameRules } from '../constants/GameRules';

describe('gameLogic - Punkteberechnung', () => {
  
  // Testdaten aus den GameRules für die Lesbarkeit extrahieren
  const { TOOL_BASE_POINTS, DISTANCE_THRESHOLDS } = GameRules;

  it('sollte die Basis-Punkte vergeben, wenn die Distanz 0 ist (Multiplier x1)', () => {
    const activeTool = 1; // Essen (5 Punkte)
    const distance = 0;
    
    const result = calculateEarnedHearts(activeTool, distance, TOOL_BASE_POINTS, DISTANCE_THRESHOLDS);
    
    expect(result.multiplier).toBe(1);
    expect(result.earnedHearts).toBe(5);
  });

  it('sollte einen x2 Multiplikator anwenden, wenn die Distanz über 250km liegt', () => {
    const activeTool = 3; // Streicheln (10 Punkte)
    const distance = 300; // > 250km
    
    const result = calculateEarnedHearts(activeTool, distance, TOOL_BASE_POINTS, DISTANCE_THRESHOLDS);
    
    expect(result.multiplier).toBe(2);
    expect(result.earnedHearts).toBe(20);
  });

  it('sollte den maximalen x10 Multiplikator bei sehr großen Distanzen anwenden', () => {
    const activeTool = 5; // Sprechblase (20 Punkte)
    const distance = 800; // > 750km
    
    const result = calculateEarnedHearts(activeTool, distance, TOOL_BASE_POINTS, DISTANCE_THRESHOLDS);
    
    expect(result.multiplier).toBe(10);
    expect(result.earnedHearts).toBe(200);
  });

  it('sollte 0 Punkte zurückgeben, wenn ein ungültiges Tool verwendet wird', () => {
    const activeTool = 999; // Existiert nicht
    const distance = 100;
    
    const result = calculateEarnedHearts(activeTool, distance, TOOL_BASE_POINTS, DISTANCE_THRESHOLDS);
    
    expect(result.earnedHearts).toBe(0);
  });
});