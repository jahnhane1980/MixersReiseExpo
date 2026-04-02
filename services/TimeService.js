import { Config } from '../constants/Config';

export const TimeService = {
  async getLocalTime(lat, lon) {
    try {
      const res = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`);
      if (!res.ok) throw new Error('Network response error');
      const data = await res.json();
      return { hour: data.hour, minute: data.minute };
    } catch (e) {
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
    if (!homeLat || !homeLon || (homeLat === 0 && homeLon === 0)) return { isJetlagged: false, diff: 0, tolerance: 0 };
    try {
      const startHour = parseInt(Config.NIGHT_MODE_START.split(':')[0]);
      const endHour = parseInt(Config.NIGHT_MODE_END.split(':')[0]);
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
      if (!currentRes.ok || !homeRes.ok) return { isJetlagged: false, diff: 0, tolerance: 0 };

      const currentData = await currentRes.json();
      const homeData = await homeRes.json();
      const diffMs = Math.abs(new Date(currentData.dateTime).getTime() - new Date(homeData.dateTime).getTime());
      const diffHours = diffMs / (1000 * 60 * 60);

      return { 
        isJetlagged: diffHours > toleranceHours, 
        diff: diffHours.toFixed(1),
        tolerance: toleranceHours.toFixed(1)
      };
    } catch (e) {
      return { isJetlagged: false, diff: 0, tolerance: 0 };
    }
  }
};