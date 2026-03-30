import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

export const StorageService = {
  // Lädt alle Spieldaten auf einmal beim App-Start
  async loadGameData() {
    try {
      const savedCount = await AsyncStorage.getItem('@punktestand');
      const savedLogbook = await AsyncStorage.getItem('@logbook');
      const savedUser = await AsyncStorage.getItem('@user_data');
      const savedNeed = await AsyncStorage.getItem('@active_need');

      return {
        punktestand: savedCount ? parseInt(savedCount, 10) : 0,
        logbook: savedLogbook ? JSON.parse(savedLogbook) : [],
        userData: savedUser ? JSON.parse(savedUser) : null,
        activeNeed: savedNeed ? JSON.parse(savedNeed) : null, // NEU
      };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Laden der Daten:", error);
      return { punktestand: 0, logbook: [], userData: null, activeNeed: null };
    }
  },

  async savePunktestand(count) {
    try {
      await AsyncStorage.setItem('@punktestand', count.toString());
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Speichern des Punktestands:", error);
    }
  },

  // NEU: Speichert das aktuelle Bedürfnis (Tool-ID und Timestamp)
  async saveActiveNeed(need) {
    try {
      if (need) {
        await AsyncStorage.setItem('@active_need', JSON.stringify(need));
      } else {
        await AsyncStorage.removeItem('@active_need');
      }
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Speichern des Bedarfs:", error);
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
      await AsyncStorage.removeItem('@active_need'); // NEU
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Zurücksetzen der Daten:", error);
    }
  }
};