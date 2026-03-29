import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

export const StorageService = {
  // Lädt alle Spieldaten auf einmal beim App-Start
  async loadGameData() {
    try {
      const savedCount = await AsyncStorage.getItem('@punktestand');
      const savedLogbook = await AsyncStorage.getItem('@logbook');
      const savedUser = await AsyncStorage.getItem('@user_data');

      return {
        punktestand: savedCount ? parseInt(savedCount, 10) : 0,
        logbook: savedLogbook ? JSON.parse(savedLogbook) : [],
        userData: savedUser ? JSON.parse(savedUser) : null,
      };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Laden der Daten:", error);
      // Fallback, damit die App nicht crasht
      return { punktestand: 0, logbook: [], userData: null };
    }
  },

  async savePunktestand(count) {
    try {
      await AsyncStorage.setItem('@punktestand', count.toString());
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Speichern des Punktestands:", error);
    }
  },

  async saveLogbook(logbook) {
    try {
      await AsyncStorage.setItem('@logbook', JSON.stringify(logbook));
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Speichern des Logbuchs:", error);
    }
  },

  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Speichern der Nutzerdaten:", error);
    }
  },

  async resetGameData() {
    try {
      await AsyncStorage.removeItem('@punktestand');
      await AsyncStorage.removeItem('@logbook');
      // Die User-Adresse lassen wir absichtlich drin, nur das "Spiel" wird resettet
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Zurücksetzen der Daten:", error);
    }
  }
};