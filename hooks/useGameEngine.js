import * as React from 'react'; 
import { StorageService } from '../services/StorageService';
import { LocationService } from '../services/LocationService';
import { TimeService } from '../services/TimeService';
import { NotificationService } from '../services/NotificationService'; 
import { calculateEarnedHearts } from '../utils/gameLogic';
import { getDistanceFromLatLonInKm } from '../utils/locationUtils';
import { GameRules } from '../constants/GameRules';
import { Config } from '../constants/Config';

export function useGameEngine(showDialog) {
  const [count, setCount] = React.useState(0);
  const [logbook, setLogbook] = React.useState([]);
  const [userData, setUserData] = React.useState({ name: Config.DEFAULT_USERNAME, address: 'Suche...', lat: 0, lon: 0 });
  const [currentLocation, setCurrentLocation] = React.useState({ city: 'Unbekannt', lat: 0, lon: 0 });
  const [rewardEvent, setRewardEvent] = React.useState({ id: 0, amount: 0 });
  const [isAppReady, setIsAppReady] = React.useState(false);
  const [activeNeed, setActiveNeed] = React.useState(null);
  const [forceRefresh, setForceRefresh] = React.useState(0); 

  // SOFORT-CHECK beim Erzeugen des Hooks
  const [isSleeping, setIsSleeping] = React.useState(() => {
    return TimeService.isMixerSleeping(new Date().getHours());
  });

  const isNeedActive = activeNeed && Date.now() >= activeNeed.timestamp;

  // DER LIVE-UMSCHALTER: Prüft alle 30 Sekunden, ob Mixer umschalten muss
  React.useEffect(() => {
    const timer = setInterval(() => {
      const currentHour = new Date().getHours();
      const shouldBeSleeping = TimeService.isMixerSleeping(currentHour);
      if (shouldBeSleeping !== isSleeping) {
        setIsSleeping(shouldBeSleeping);
      }
    }, 30000); 
    return () => clearInterval(timer);
  }, [isSleeping]);

  // UI-Refresh wenn ein Bedürfnis "fällig" wird
  React.useEffect(() => {
    if (activeNeed && !isNeedActive) {
      const delay = activeNeed.timestamp - Date.now();
      const timer = setTimeout(() => {
        setForceRefresh(prev => prev + 1); 
      }, delay + 100); 
      return () => clearTimeout(timer);
    }
  }, [activeNeed, isNeedActive]);

  /**
   * Berechnet den nächsten Wach-Zeitpunkt.
   * Schiebt Zeiten in der Nacht automatisch auf den nächsten Morgen.
   */
  const calculateAwakeTrigger = React.useCallback((delayMs) => {
    const now = new Date();
    let triggerTime = new Date(now.getTime() + delayMs);
    
    const startNight = parseInt(Config.NIGHT_MODE_START?.split(':')[0] || 22);
    const endNight = parseInt(Config.NIGHT_MODE_END?.split(':')[0] || 6);
    const hour = triggerTime.getHours();

    // Logik: Falls in der Nacht, setze auf "Morgen nach Ende der Nachtruhe"
    if (startNight > endNight) {
      if (hour >= startNight || hour < endNight) {
        triggerTime.setHours(endNight + 1, 0, 0, 0); 
        if (hour >= startNight) triggerTime.setDate(triggerTime.getDate() + 1);
      }
    } else {
      if (hour >= startNight && hour < endNight) {
        triggerTime.setHours(endNight + 1, 0, 0, 0);
      }
    }
    return triggerTime;
  }, []);

  /**
   * Generiert ein neues Bedürfnis und plant die Benachrichtigung.
   */
  const generateRandomNeed = React.useCallback(async (lastToolId = null) => {
    // STRIKTE NACHTSPERRE: Keine neuen Bedürfnisse im Schlaf
    if (isSleeping) return;

    const toolIds = [1, 2, 3, 4, 5];
    let randomTool;
    do {
      randomTool = toolIds[Math.floor(Math.random() * toolIds.length)];
    } while (randomTool === lastToolId);

    const delay = Math.random() * (Config.NEED_CONFIG.NEXT_NEED_DELAY_MAX - Config.NEED_CONFIG.NEXT_NEED_DELAY_MIN) + Config.NEED_CONFIG.NEXT_NEED_DELAY_MIN;
    const triggerTime = calculateAwakeTrigger(delay);

    const newNeed = { toolId: randomTool, timestamp: triggerTime.getTime() };
    setActiveNeed(newNeed);
    await StorageService.saveActiveNeed(newNeed);

    const messages = { 1: "Hunger! 🍎", 2: "Durst! 🥤", 3: "Streichel mich! ✋", 4: "Dreckig! 🧼", 5: "Rede mit mir! 💬" };
    const secondsToTrigger = Math.max((triggerTime.getTime() - Date.now()) / 1000, 1);
    
    // Notification nur planen, wenn Mixer wach ist
    await NotificationService.scheduleReminder(secondsToTrigger, "Mixer", messages[randomTool]);
  }, [isSleeping, calculateAwakeTrigger]);

  /**
   * Initialisierung beim App-Start
   */
  React.useEffect(() => {
    const init = async () => {
      const data = await StorageService.loadGameData();
      setCount(data.punktestand);
      setLogbook(data.logbook || []);
      setActiveNeed(data.activeNeed);
      if (data.userData) setUserData(data.userData);

      const locResult = await LocationService.getCurrentLocationData();
      if (locResult.success) {
        setCurrentLocation({ city: locResult.city, lat: locResult.lat, lon: locResult.lon });
        const timeData = await TimeService.getLocalTime(locResult.lat, locResult.lon);
        setIsSleeping(TimeService.isMixerSleeping(timeData.hour));
      }

      setIsAppReady(true);
      
      // Nur generieren, wenn wir wach sind und kein Wunsch offen ist
      if (!data.activeNeed && !TimeService.isMixerSleeping(new Date().getHours())) {
        generateRandomNeed();
      }
    };
    init();
  }, [generateRandomNeed]);

  /**
   * Verarbeitung der User-Aktion
   */
  const processInteraction = (activeTool) => {
    // Interaktion im Schlaf oder ohne aktives Bedürfnis blockieren
    if (isSleeping || !isNeedActive || activeTool !== activeNeed.toolId) return { success: false };

    const distance = getDistanceFromLatLonInKm(userData.lat, userData.lon, currentLocation.lat, currentLocation.lon);
    const result = calculateEarnedHearts(activeTool, distance, GameRules.TOOL_BASE_POINTS, GameRules.DISTANCE_THRESHOLDS, activeNeed);
    
    const earned = result.earnedHearts;
    setCount(prev => prev + earned);
    setRewardEvent({ id: Date.now(), amount: earned });

    // Logbuch aktualisieren
    setLogbook(prev => {
      const idx = prev.findIndex(e => e.city === currentLocation.city);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + earned };
        return next;
      }
      return [...prev, { id: Date.now().toString(), city: currentLocation.city, count: earned }];
    });

    const lastId = activeNeed.toolId;
    setActiveNeed(null);
    StorageService.saveActiveNeed(null);
    
    // Nächstes Bedürfnis würfeln (wird durch generateRandomNeed nachts gestoppt)
    generateRandomNeed(lastId);

    return { success: true, isAtHome: result.isAtHome };
  };

  return {
    count, 
    logbook, 
    userData, 
    currentLocation, 
    rewardEvent, 
    isAppReady, 
    processInteraction, 
    resetGame: async () => { 
      setCount(0); 
      setLogbook([]); 
      setActiveNeed(null); 
      await StorageService.saveActiveNeed(null); 
      await StorageService.resetGameData(); 
    }, 
    isSleeping, 
    activeNeed, 
    isNeedActive
  };
}