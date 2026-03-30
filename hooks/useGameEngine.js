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
  const [isSleeping, setIsSleeping] = React.useState(false);
  const [activeNeed, setActiveNeed] = React.useState(null);
  const [forceRefresh, setForceRefresh] = React.useState(0); 

  const isNeedActive = activeNeed && Date.now() >= activeNeed.timestamp;

  React.useEffect(() => {
    if (activeNeed && !isNeedActive) {
      const delay = activeNeed.timestamp - Date.now();
      const timer = setTimeout(() => {
        setForceRefresh(prev => prev + 1); 
      }, delay + 100); 
      return () => clearTimeout(timer);
    }
  }, [activeNeed, isNeedActive]);

  const calculateAwakeTrigger = React.useCallback((delayMs) => {
    const now = new Date();
    let triggerTime = new Date(now.getTime() + delayMs);
    const hour = triggerTime.getHours();
    const startNight = parseInt(Config.NIGHT_MODE_START.split(':')[0]);
    const endNight = parseInt(Config.NIGHT_MODE_END.split(':')[0]);

    if (hour >= startNight || hour < endNight) {
      triggerTime.setHours(endNight + 1, 0, 0, 0); 
      if (hour >= startNight) triggerTime.setDate(triggerTime.getDate() + 1);
    }
    return triggerTime;
  }, []);

  const generateRandomNeed = React.useCallback(async (lastToolId = null) => {
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
    await NotificationService.scheduleReminder(secondsToTrigger, "Mixer braucht dich!", messages[randomTool]);
  }, [isSleeping, calculateAwakeTrigger]);

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
        if (!data.activeNeed && !TimeService.isMixerSleeping(timeData.hour)) generateRandomNeed();
      }
      setIsAppReady(true);
    };
    init();
  }, [generateRandomNeed]);

  // WICHTIG: Sync mit Logbuch
  React.useEffect(() => {
    if (isAppReady) {
      StorageService.savePunktestand(count);
      StorageService.saveLogbook(logbook);
    }
  }, [count, logbook, isAppReady]);

  const processInteraction = (activeTool) => {
    if (!isNeedActive || activeTool !== activeNeed.toolId) return { success: false };

    const distance = getDistanceFromLatLonInKm(userData.lat, userData.lon, currentLocation.lat, currentLocation.lon);
    const result = calculateEarnedHearts(activeTool, distance, GameRules.TOOL_BASE_POINTS, GameRules.DISTANCE_THRESHOLDS, activeNeed);
    
    const earned = result.earnedHearts;
    setCount(prev => prev + earned);
    setRewardEvent({ id: Date.now(), amount: earned });

    // LOGBUCH AKTUALISIERUNG
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
    generateRandomNeed(lastId);

    return { success: true, isAtHome: result.isAtHome };
  };

  return {
    count, logbook, userData, setUserData, currentLocation, rewardEvent, isAppReady, processInteraction, 
    resetGame: async () => { setCount(0); setLogbook([]); setActiveNeed(null); await StorageService.saveActiveNeed(null); await StorageService.resetGameData(); }, 
    isSleeping, activeNeed, isNeedActive
  };
}