import { Config } from '../constants/Config';

export const TimeService = {
  /**
   * Holt die lokale Uhrzeit basierend auf Koordinaten.
   */
  async getLocalTime(lat, lon) {
    try {
      const response = await fetch(
        `https://www.timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`
      );
      if (!response.ok) throw new Error('TimeAPI unreachable');
      
      const data = await response.json();
      return { hour: data.hour, success: true };
    } catch (error) {
      if (Config.DEBUG_MODE) console.error("TimeService Fehler:", error);
      // Fallback auf Systemzeit
      return { hour: new Date().getHours(), success: false };
    }
  },

  /**
   * Prüft, ob Mixer schlafen sollte.
   * Extrahiert die Stunden direkt aus den Config-Strings.
   */
  isMixerSleeping(hour) {
    const startHour = parseInt(Config.NIGHT_MODE_START.split(':')[0]);
    const endHour = parseInt(Config.NIGHT_MODE_END.split(':')[0]);

    if (startHour > endHour) {
      // Fall: 22:00 bis 06:00 (über Mitternacht)
      return hour >= startHour || hour < endHour;
    }
    // Fall: Zeitspanne innerhalb eines Tages
    return hour >= startHour && hour < endHour;
  }
};