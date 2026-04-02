import { Config } from '../constants/Config';

export const TimeService = {
  /**
   * Holt die lokale Zeit für bestimmte Koordinaten.
   * Gibt nun ein Status-Objekt zurück.
   */
  async getLocalTime(lat, lon) {
    try {
      const res = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`);
      if (!res.ok) throw new Error('API-Antwort nicht ok');
      const data = await res.json();
      return { success: true, hour: data.hour, minute: data.minute };
    } catch (e) {
      if (Config.DEBUG_MODE) console.warn("TimeService (getLocalTime):", e.message);
      const now = new Date();
      return { 
        success: false, 
        error: 'Verbindung fehlgeschlagen', 
        hour: now.getHours(), 
        minute: now.getMinutes() 
      };
    }
  },

  isMixerSleeping(currentHour) {
    const startHour = parseInt(Config.NIGHT_MODE_START.split(':')[0]);
    const endHour = parseInt(Config.NIGHT_MODE_END.split(':')[0]);
    if (startHour > endHour) {
      return currentHour >= startHour || currentHour < endHour;
    } else {
      return currentHour >= startHour && currentHour < endHour;
    }
  },

  /**
   * Prüft auf Jetlag und meldet nun explizit Fehler zurück.
   */
  async checkJetlag(currentLat, currentLon, homeLat, homeLon) {
    if (!homeLat || !homeLon || (homeLat === 0 && homeLon === 0)) {
      return { success: true, isJetlagged: false, diff: 0, tolerance: 0 };
    }
    
    try {
      const startHour = parseInt(Config.NIGHT_MODE_START.split(':')[0]);
      const endHour = parseInt(Config.NIGHT_MODE_END.split(':')[0]);
      
      let sleepHours = (startHour > endHour) ? (24 - startHour) + endHour : endHour - startHour;
      const awakeHours = 24 - sleepHours;
      const toleranceHours = awakeHours * 0.2; 

      const currentRes = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${currentLat}&longitude=${currentLon}`);
      const homeRes = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${homeLat}&longitude=${homeLon}`);
      
      if (!currentRes.ok || !homeRes.ok) throw new Error('API-Verbindungsfehler');

      const currentData = await currentRes.json();
      const homeData = await homeRes.json();
      const diffMs = Math.abs(new Date(currentData.dateTime).getTime() - new Date(homeData.dateTime).getTime());
      const diffHours = diffMs / (1000 * 60 * 60);

      return { 
        success: true,
        isJetlagged: diffHours > toleranceHours, 
        diff: diffHours.toFixed(1),
        tolerance: toleranceHours.toFixed(1)
      };
    } catch (e) {
      if (Config.DEBUG_MODE) console.error("TimeService (checkJetlag):", e.message);
      return { 
        success: false, 
        error: 'Zeitzonen konnten nicht abgeglichen werden.', 
        isJetlagged: false, 
        diff: 0, 
        tolerance: 0 
      };
    }
  }
};