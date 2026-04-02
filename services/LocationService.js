import * as Location from 'expo-location';
import { Config } from '../constants/Config';

export const LocationService = {
  // Holt die aktuellen GPS-Daten und macht direkt den Reverse-Geocode für die Stadt
  async getCurrentLocationData() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      // 🦆 Fassaden-Magie: Hier klinken wir unseren Entwickler-Schalter ein!
      if (Config.MOCK_LOCATION) {
        return {
          success: true,
          city: 'Test-City',
          lat: 50.0,
          lon: 10.0,
          accuracy: 5, // Mock-Genauigkeit von 5 Metern
          rawAddressData: { street: 'Mockstraße', streetNumber: '42', postalCode: '12345', city: 'Test-City' }
        };
      }

      // KORREKTUR: Ausgewogene Genauigkeit anfordern für stabilere Werte
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      let geo = await Location.reverseGeocodeAsync(loc.coords);
      
      if (geo.length > 0) {
        const currentCity = geo[0].city || geo[0].subregion || 'Unbekannter Ort';
        return {
          success: true,
          city: currentCity,
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
          accuracy: loc.coords.accuracy, // Radius der Genauigkeit in Metern
          rawAddressData: geo[0]
        };
      }

      return { success: false, error: 'No geocode data found' };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("LocationService: Fehler bei der Standortermittlung:", error);
      return { success: false, error: error.message };
    }
  },

  // Wandelt einen eingegebenen Text-String (z.B. aus dem SettingsModal) in Koordinaten um
  async getCoordinatesFromAddress(address) {
    try {
      let geoResult = await Location.geocodeAsync(address);
      
      if (geoResult.length > 0) {
        return {
          success: true,
          lat: geoResult[0].latitude,
          lon: geoResult[0].longitude
        };
      }
      return { success: false, error: 'Address not found' };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("LocationService: Fehler bei der Adressauflösung:", error);
      return { success: false, error: error.message };
    }
  }
};