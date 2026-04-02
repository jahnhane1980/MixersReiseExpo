import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

export const StorageService = {
  async loadGameData() {
    try {
      const savedCount = await AsyncStorage.getItem('@punktestand');
      const savedLogbook = await AsyncStorage.getItem('@logbook');
      const savedUser = await AsyncStorage.getItem('@user_data');
      const savedNeed = await AsyncStorage.getItem('@active_need');
      const savedAdaptedLoc = await AsyncStorage.getItem('@adapted_location');

      return {
        punktestand: savedCount ? parseInt(savedCount, 10) : 0,
        logbook: savedLogbook ? JSON.parse(savedLogbook) : [],
        userData: savedUser ? JSON.parse(savedUser) : null,
        activeNeed: savedNeed ? JSON.parse(savedNeed) : null,
        adaptedLocation: savedAdaptedLoc ? JSON.parse(savedAdaptedLoc) : null,
      };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Fehler beim Laden:", error);
      return { punktestand: 0, logbook: [], userData: null, activeNeed: null, adaptedLocation: null };
    }
  },

  async savePunktestand(count) {
    try {
      await AsyncStorage.setItem('@punktestand', count.toString());
    } catch (error) {}
  },

  async saveActiveNeed(need) {
    try {
      if (need) await AsyncStorage.setItem('@active_need', JSON.stringify(need));
      else await AsyncStorage.removeItem('@active_need');
    } catch (error) {}
  },

  async saveAdaptedLocation(location) {
    try {
      if (location) await AsyncStorage.setItem('@adapted_location', JSON.stringify(location));
      else await AsyncStorage.removeItem('@adapted_location');
    } catch (error) {}
  },

  async saveLogbook(logbook) {
    try {
      await AsyncStorage.setItem('@logbook', JSON.stringify(logbook));
    } catch (error) {}
  },

  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
    } catch (error) {}
  },

  async resetGameData() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("StorageService: Reset fehlgeschlagen:", error);
    }
  }
};