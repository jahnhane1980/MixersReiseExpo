import { getDistanceFromLatLonInKm } from './locationUtils';

describe('locationUtils - Haversine Formel', () => {
  
  it('sollte exakt 0 km berechnen, wenn Start- und Zielpunkt identisch sind', () => {
    // Gleiche Koordinaten für Start und Ziel
    const distance = getDistanceFromLatLonInKm(50.1109, 8.6821, 50.1109, 8.6821);
    
    expect(distance).toBe(0);
  });

  it('sollte eine realistische Distanz für zwei unterschiedliche Punkte berechnen', () => {
    // Ein Grad Unterschied am Äquator entspricht mathematisch ca. 111.19 km
    // Wir testen von Längengrad 0 auf Längengrad 1
    const distance = getDistanceFromLatLonInKm(0, 0, 0, 1);
    
    // Da es minimale Abweichungen durch die Erdkrümmungs-Konstante (R=6371) geben kann,
    // prüfen wir auf eine realistische Spanne anstatt auf eine knallharte Kommazahl.
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(112);
  });

  it('sollte mit negativen Koordinaten (Südhalbkugel / Westlich) umgehen können', () => {
    // Von Äquator/Nullmeridian (0,0) nach Süd-Westen (-1, -1)
    const distance = getDistanceFromLatLonInKm(0, 0, -1, -1);
    
    // Die Distanz (Diagonale) sollte größer sein als 111km, aber kleiner als 200km
    expect(distance).toBeGreaterThan(111);
    expect(distance).toBeLessThan(200);
  });

});