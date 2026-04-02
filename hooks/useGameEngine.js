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
  const [userData, setUserData] = React.useState({ name: Config.DEFAULT_USERNAME, address: '', lat: 0, lon: 0 });
  const [currentLocation, setCurrentLocation] = React.useState({ city: 'Unbekannt', lat: 0, lon: 0 });
  const [rewardEvent, setRewardEvent] = React.useState({ id: 0, amount: 0, isPenalty: false });
  const [isAppReady, setIsAppReady] = React.useState(false);
  const [activeNeed, setActiveNeed] = React.useState(null);
  const [forceRefresh, setForceRefresh] = React.useState(0); 
  const [isOverdue, setIsOverdue] = React.useState(false);
  const [isJetlagged, setIsJetlagged] = React.useState(false);
  const [adaptedLocation, setAdaptedLocation] = React.useState(null); 
  const [debugInfo, setDebugInfo] = React.useState(""); 

  const [isSleeping, setIsSleeping] = React.useState(() => {
    return TimeService.isMixerSleeping(new Date().getHours());
  });

  const isNeedActive = activeNeed && Date.now() >= activeNeed.timestamp;

  React.useEffect(() => {
    const timer = setInterval(() => {
      const currentHour = new Date().getHours();
      const shouldBeSleeping = TimeService.isMixerSleeping(currentHour);
      if (shouldBeSleeping !== isSleeping) setIsSleeping(shouldBeSleeping);
    }, 30000); 
    return () => clearInterval(timer);
  }, [isSleeping]);

  React.useEffect(() => {
    if (isJetlagged && isSleeping && currentLocation.lat !== 0) {
      setIsJetlagged(false); 
      const newAdaptation = { lat: currentLocation.lat, lon: currentLocation.lon };
      setAdaptedLocation(newAdaptation);
      StorageService.saveAdaptedLocation(newAdaptation);
    }
  }, [isJetlagged, isSleeping, currentLocation.lat, currentLocation.lon]);

  const performJetlagCheck = async () => {
    const baseLat = adaptedLocation ? adaptedLocation.lat : userData.lat;
    const baseLon = adaptedLocation ? adaptedLocation.lon : userData.lon;
    if (baseLat !== 0 && currentLocation.lat !== 0) {
      const result = await TimeService.checkJetlag(currentLocation.lat, currentLocation.lon, baseLat, baseLon);
      setIsJetlagged(result.isJetlagged);
      const baseMode = adaptedLocation ? "Adaptiert" : "Heimat";
      setDebugInfo(`${baseMode} | Diff: ${result.diff}h | Tol: ${result.tolerance}h`);
    }
  };

  React.useEffect(() => {
    performJetlagCheck();
  }, [userData.lat, userData.lon, currentLocation.lat, currentLocation.lon, adaptedLocation]);

  React.useEffect(() => {
    const init = async () => {
      const data = await StorageService.loadGameData();
      setCount(data.punktestand);
      setLogbook(data.logbook || []);
      setActiveNeed(data.activeNeed);
      if (data.userData) setUserData(data.userData);
      if (data.adaptedLocation) setAdaptedLocation(data.adaptedLocation);

      const locResult = await LocationService.getCurrentLocationData();
      if (locResult.success) {
        setCurrentLocation({ city: locResult.city, lat: locResult.lat, lon: locResult.lon });
        const timeData = await TimeService.getLocalTime(locResult.lat, locResult.lon);
        setIsSleeping(TimeService.isMixerSleeping(timeData.hour));
      }
      setIsAppReady(true);
    };
    if (!isAppReady) init();
  }, [isAppReady]);

  const processInteraction = (activeTool) => {
    if (isSleeping || !activeNeed || activeTool !== activeNeed.toolId) return { success: false };
    const distance = getDistanceFromLatLonInKm(userData.lat, userData.lon, currentLocation.lat, currentLocation.lon);
    const result = calculateEarnedHearts(activeTool, distance, GameRules.TOOL_BASE_POINTS, GameRules.DISTANCE_THRESHOLDS, activeNeed);
    setCount(prev => {
      const newCount = prev + result.earnedHearts;
      StorageService.savePunktestand(newCount); 
      return newCount;
    });
    setRewardEvent({ id: Date.now(), amount: Math.abs(result.earnedHearts), isPenalty: result.isPenalty });
    setActiveNeed(null);
    StorageService.saveActiveNeed(null);
    return { success: true, isAtHome: result.isAtHome, isPenalty: result.isPenalty };
  };

  return {
    count, userData, currentLocation, rewardEvent, isAppReady, processInteraction, 
    setUserData: async (newData) => {
      setUserData(newData);
      await StorageService.saveUserData(newData);
    },
    resetGame: async () => { 
      // 1. Alle Speicher löschen
      await StorageService.resetGameData(); 
      // 2. Alle States sofort auf Null
      setCount(0);
      setLogbook([]);
      setUserData({ name: Config.DEFAULT_USERNAME, address: '', lat: 0, lon: 0 });
      setActiveNeed(null);
      setIsJetlagged(false);
      setAdaptedLocation(null);
      setIsOverdue(false);
      setDebugInfo("");
    }, 
    isSleeping, activeNeed, isNeedActive, isOverdue, isJetlagged, debugInfo 
  };
}