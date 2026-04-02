import * as React from 'react'; 
import { StorageService } from '../services/StorageService';
import { LocationService } from '../services/LocationService';
import { TimeService } from '../services/TimeService';
import { NotificationService } from '../services/NotificationService'; 
import { calculateEarnedHearts } from '../utils/gameLogic';
import { getDistanceFromLatLonInKm } from '../utils/locationUtils';
import { GameRules } from '../constants/GameRules'; 
import { Config } from '../constants/Config';

const NEED_MESSAGES = { 1: "Hunger! 🍎", 2: "Durst! 🥤", 3: "Streichel mich! ✋", 4: "Dreckig! 🧼", 5: "Rede mit mir! 💬" };

export function useGameEngine(showDialog) {
  const [count, setCount] = React.useState(0);
  const [logbook, setLogbook] = React.useState([]);
  const [userData, setUserData] = React.useState({ name: Config.DEFAULT_USERNAME, address: '', lat: 0, lon: 0 });
  const [currentLocation, setCurrentLocation] = React.useState({ city: 'Unbekannt', lat: 0, lon: 0 });
  const [rewardEvent, setRewardEvent] = React.useState({ id: 0, amount: 0, isPenalty: false });
  const [isAppReady, setIsAppReady] = React.useState(false);
  const [activeNeed, setActiveNeed] = React.useState(null);
  const [isOverdue, setIsOverdue] = React.useState(false);
  const [isJetlagged, setIsJetlagged] = React.useState(false);
  const [adaptedLocation, setAdaptedLocation] = React.useState(null); 
  const [debugInfo, setDebugInfo] = React.useState(""); 
  const [forceRefresh, setForceRefresh] = React.useState(0);

  const [isSleeping, setIsSleeping] = React.useState(() => {
    return TimeService.isMixerSleeping(new Date().getHours());
  });

  const isNeedActive = activeNeed && Date.now() >= activeNeed.timestamp;

  React.useEffect(() => {
    if (activeNeed && !isNeedActive) {
      const delay = Math.max(activeNeed.timestamp - Date.now(), 0);
      const timer = setTimeout(() => setForceRefresh(p => p + 1), delay + 100);
      return () => clearTimeout(timer);
    }
  }, [activeNeed, isNeedActive]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const currentHour = new Date().getHours();
      const shouldBeSleeping = TimeService.isMixerSleeping(currentHour);
      if (shouldBeSleeping !== isSleeping) setIsSleeping(shouldBeSleeping);
    }, 30000); 
    return () => clearInterval(timer);
  }, [isSleeping]);

  React.useEffect(() => {
    let timer;
    if (activeNeed && isNeedActive) {
      const timeSinceNeed = Date.now() - activeNeed.timestamp;
      const penaltyThreshold = Config.NEED_CONFIG.PENALTY_AFTER;
      if (timeSinceNeed >= penaltyThreshold) setIsOverdue(true); 
      else {
        setIsOverdue(false);
        timer = setTimeout(() => setIsOverdue(true), penaltyThreshold - timeSinceNeed);
      }
    } else setIsOverdue(false);
    return () => { if (timer) clearTimeout(timer); };
  }, [activeNeed, isNeedActive]);

  React.useEffect(() => {
    if (isJetlagged && isSleeping && currentLocation.lat !== 0) {
      setIsJetlagged(false); 
      const loc = { lat: currentLocation.lat, lon: currentLocation.lon };
      setAdaptedLocation(loc);
      StorageService.saveAdaptedLocation(loc);
    }
  }, [isJetlagged, isSleeping, currentLocation.lat, currentLocation.lon]);

  const calculateAwakeTrigger = React.useCallback((delayMs) => {
    const now = new Date();
    let triggerTime = new Date(now.getTime() + delayMs);
    const start = parseInt(Config.NIGHT_MODE_START.split(':')[0]);
    const end = parseInt(Config.NIGHT_MODE_END.split(':')[0]);
    const hr = triggerTime.getHours();
    if (start > end) {
      if (hr >= start || hr < end) {
        triggerTime.setHours(end, 0, 0, 0); 
        if (hr >= start) triggerTime.setDate(triggerTime.getDate() + 1);
      }
    } else if (hr >= start && hr < end) triggerTime.setHours(end, 0, 0, 0);
    return triggerTime;
  }, []);

  const generateRandomNeed = React.useCallback(async () => {
    if (isSleeping || (userData.lat === 0 && userData.lon === 0)) return;
    const toolIds = [1, 2, 3, 4, 5];
    const tool = toolIds[Math.floor(Math.random() * toolIds.length)];
    const delay = Math.random() * (Config.NEED_CONFIG.NEXT_NEED_DELAY_MAX - Config.NEED_CONFIG.NEXT_NEED_DELAY_MIN) + Config.NEED_CONFIG.NEXT_NEED_DELAY_MIN;
    const trigger = calculateAwakeTrigger(delay);
    const need = { toolId: tool, timestamp: trigger.getTime() };
    setActiveNeed(need);
    await StorageService.saveActiveNeed(need);
  }, [isSleeping, userData.lat, userData.lon, calculateAwakeTrigger]);

  React.useEffect(() => {
    if (isAppReady && !activeNeed && !isSleeping && userData.lat !== 0) generateRandomNeed();
  }, [isAppReady, activeNeed, isSleeping, userData.lat, generateRandomNeed]);

  React.useEffect(() => {
    const check = async () => {
      const baseLat = adaptedLocation ? adaptedLocation.lat : userData.lat;
      const baseLon = adaptedLocation ? adaptedLocation.lon : userData.lon;
      if (baseLat !== 0 && currentLocation.lat !== 0) {
        const res = await TimeService.checkJetlag(currentLocation.lat, currentLocation.lon, baseLat, baseLon);
        setIsJetlagged(res.isJetlagged);
        setDebugInfo(`${adaptedLocation ? "Adaptiert" : "Heimat"} | Diff: ${res.diff}h | Tol: ${res.tolerance}h`);
      }
    };
    check();
  }, [userData.lat, userData.lon, currentLocation.lat, currentLocation.lon, adaptedLocation]);

  React.useEffect(() => {
    const init = async () => {
      const data = await StorageService.loadGameData();
      setCount(data.punktestand);
      setLogbook(data.logbook || []);
      if (data.userData) setUserData(data.userData);
      if (data.activeNeed) setActiveNeed(data.activeNeed);
      if (data.adaptedLocation) setAdaptedLocation(data.adaptedLocation);
      const loc = await LocationService.getCurrentLocationData();
      if (loc.success) setCurrentLocation({ city: loc.city, lat: loc.lat, lon: loc.lon });
      setIsAppReady(true);
    };
    init();
  }, []);

  const processInteraction = (toolId) => {
    if (isSleeping || !isNeedActive || toolId !== activeNeed.toolId) return { success: false };
    const dist = getDistanceFromLatLonInKm(userData.lat, userData.lon, currentLocation.lat, currentLocation.lon);
    const res = calculateEarnedHearts(toolId, dist, GameRules.TOOL_BASE_POINTS, GameRules.DISTANCE_THRESHOLDS, activeNeed);
    const earned = res.earnedHearts;
    
    setCount(prev => {
      const val = prev + earned;
      StorageService.savePunktestand(val);
      return val;
    });

    setRewardEvent({ id: Date.now() + Math.random(), amount: Math.max(Math.abs(earned), 5), isPenalty: res.isPenalty });

    setLogbook(prev => {
      let next;
      const idx = prev.findIndex(e => e.city === currentLocation.city);
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + earned };
      } else next = [...prev, { id: Date.now().toString(), city: currentLocation.city, count: earned }];
      StorageService.saveLogbook(next);
      return next;
    });

    setActiveNeed(null);
    StorageService.saveActiveNeed(null);
    generateRandomNeed();
    return { success: true, isAtHome: res.isAtHome, isPenalty: res.isPenalty, earnedHearts: earned };
  };

  return {
    count, logbook, userData, currentLocation, rewardEvent, isAppReady, processInteraction, 
    setUserData: async (d) => {
      setUserData(d);
      await StorageService.saveUserData(d);
      setAdaptedLocation(null);
      await StorageService.saveAdaptedLocation(null);
    },
    resetGame: async () => { 
      await StorageService.resetGameData(); 
      setCount(0); setLogbook([]); setAdaptedLocation(null); setIsJetlagged(false); setActiveNeed(null);
      setUserData({ name: Config.DEFAULT_USERNAME, address: '', lat: 0, lon: 0 });
    }, 
    isSleeping, activeNeed, isNeedActive, isOverdue, isJetlagged, debugInfo,
    activeNeedMessage: (isNeedActive && activeNeed) ? NEED_MESSAGES[activeNeed.toolId] : null
  };
}