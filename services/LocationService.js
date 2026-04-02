import * as Location from 'expo-location';
import { Config } from '../constants/Config';

export const LocationService = {
  async getCurrentLocationData() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      if (Config.MOCK_LOCATION) {
        return {
          success: true,
          city: 'Test-City',
          lat: 50.0,
          lon: 10.0,
          accuracy: 5, // Mock-Genauigkeit 5m
          rawAddressData: { city: 'Test-City' }
        };
      }

      // KORREKTUR: Explizite Genauigkeit anfordern
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
          accuracy: loc.coords.accuracy, // Radius in Metern
          rawAddressData: geo[0]
        };
      }

      return { success: false, error: 'No geocode data found' };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("LocationService: Fehler:", error);
      return { success: false, error: error.message };
    }
  },

  async getCoordinatesFromAddress(address) {
    try {
      let geoResult = await Location.geocodeAsync(address);
      if (geoResult.length > 0) {
        return { success: true, lat: geoResult[0].latitude, lon: geoResult[0].longitude };
      }
      return { success: false, error: 'Address not found' };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("LocationService: Fehler:", error);
      return { success: false, error: error.message };
    }
  }
};