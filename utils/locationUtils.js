/**
 * Berechnet die Luftlinien-Distanz zwischen zwei Geokoordinaten in Kilometern
 * basierend auf der mathematischen Haversine-Formel.
 * * @param {number} lat1 - Breitengrad Startpunkt
 * @param {number} lon1 - Längengrad Startpunkt
 * @param {number} lat2 - Breitengrad Zielpunkt
 * @param {number} lon2 - Längengrad Zielpunkt
 * @returns {number} Distanz in Kilometern
 */
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Erdradius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
};