import { Config } from '../constants/Config';

export const TimeService = {
  async getLocalTime(lat, lon) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); 
      const res = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return { hour: data.hour, minute: data.minute };
    } catch (e) {
      console.warn("Time API fehlgeschlagen, nutze Systemzeit", e);
      const now = new Date();
      return { hour: now.getHours(), minute: now.getMinutes() };
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

  async checkJetlag(currentLat, currentLon, homeLat, homeLon) {
    if (!homeLat || !homeLon || (homeLat === 0 && homeLon === 0)) return { isJetlagged: false, diff: 0 };

    try {
      const startHour = parseInt(Config.NIGHT_MODE_START.split(':')[0]);
      const endHour = parseInt(Config.NIGHT_MODE_END.split(':')[0]);
      
      // FIX: Korrekte Berechnung der Wachzeit
      let sleepHours = 0;
      if (startHour > endHour) {
        sleepHours = (24 - startHour) + endHour;
      } else {
        sleepHours = endHour - startHour;
      }
      const awakeHours = 24 - sleepHours;
      const toleranceHours = awakeHours * 0.2; 

      const currentRes = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${currentLat}&longitude=${currentLon}`);
      const homeRes = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${homeLat}&longitude=${homeLon}`);
      
      if (!currentRes.ok || !homeRes.ok) return { isJetlagged: false, diff: 0 };

      const currentData = await currentRes.json();
      const homeData = await homeRes.json();

      const currentObj = new Date(currentData.dateTime);
      const homeObj = new Date(homeData.dateTime);

      const diffMs = Math.abs(currentObj.getTime() - homeObj.getTime());
      const diffHours = diffMs / (1000 * 60 * 60);

      // Wir geben ein Objekt zurück, damit wir die Differenz im Debug sehen
      return { 
        isJetlagged: diffHours > toleranceHours, 
        diff: diffHours.toFixed(1),
        tolerance: toleranceHours.toFixed(1)
      };

    } catch (e) {
      console.warn("Jetlag API Check fehlgeschlagen", e);
      return { isJetlagged: false, diff: 0 };
    }
  }
};