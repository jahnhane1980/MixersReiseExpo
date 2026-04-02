import * as React from 'react'; 
import { StorageService } from '../services/StorageService';
import { LocationService } from '../services/LocationService';
import { TimeService } from '../services/TimeService';
import { NotificationService } from '../services/NotificationService'; 
import { calculateEarnedHearts } from '../utils/gameLogic';
import { getDistanceFromLatLonInKm } from '../utils/locationUtils';
import { GameRules } from '../constants/GameRules'; 
import { Config } from '../constants/Config';

const NEED_MESSAGES = { 
  1: "Hunger! 🍎", 
  2: "Durst! 🥤", 
  3: "Streichel mich! ✋", 
  4: "Dreckig! 🧼", 
  5: "Rede mit mir! 💬" 
};

// Statische Hilfsfunktion außerhalb des Hooks für maximale Stabilität
const calculateAwakeTrigger = (delayMs) => {
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
  } else if (hr >= start && hr < end) {
    triggerTime.setHours(end, 0, 0, 0);
  }
  return triggerTime;
};

export function useGameEngine(showDialog) {
  const [count, setCount] = React.useState(0);
  const [logbook, setLogbook] = React.useState([]);
  const [userData, setUserData] = React.useState({ name: Config.DEFAULT_USERNAME, address: '', lat: 0, lon: 0 });
  const [currentLocation, setCurrentLocation] = React.useState({ city: 'Unbekannt', lat: 0, lon: 0, accuracy: 0 });
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

  // Primitive Abhängigkeiten für stabile Effekte
  const homeLat = userData?.lat || 0;
  const homeLon = userData?.lon || 0;
  const isNeedActive = activeNeed && activeNeed.timestamp && Date.now() >= activeNeed.timestamp;

  // Hilfsfunktion zum Planen der Notification
  const scheduleOverdueNotification = (need) => {
    if (!need) return;
    const overdueTimestamp = need.timestamp + Config.NEED_CONFIG.PENALTY_AFTER;
    const secondsUntilOverdue = (overdueTimestamp - Date.now()) / 1000;
    
    if (secondsUntilOverdue > 0) {
      NotificationService.scheduleReminder(
        secondsUntilOverdue, 
        "Mixer ist traurig!", 
        `Du hast dich zu lange nicht um das Bedürfnis "${NEED_MESSAGES[need.toolId]}" gekümmert.`
      );
    }
  };

  // --- AUTOMATISCHE SPEICHERUNG ---
  React.useEffect(() => {
    if (isAppReady) StorageService.savePunktestand(count);
  }, [count, isAppReady]);

  React.useEffect(() => {
    if (isAppReady && logbook.length > 0) StorageService.saveLogbook(logbook);
  }, [logbook, isAppReady]);

  // --- STATUS UPDATES ---
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

  // Jetlag-Logik mit Race-Condition-Schutz
  React.useEffect(() => {
    let ignore = false;
    const check = async () => {
      const baseLat = adaptedLocation ? adaptedLocation.lat : homeLat;
      const baseLon = adaptedLocation ? adaptedLocation.lon : homeLon;
      
      // Nur ausführen, wenn wir valide Heimat- und Standortdaten haben
      if (baseLat !== 0 && currentLocation.lat !== 0) {
        const res = await TimeService.checkJetlag(currentLocation.lat, currentLocation.lon, baseLat, baseLon);
        if (!ignore) {
          if (res.success) {
            setIsJetlagged(res.isJetlagged);
            setDebugInfo(`${adaptedLocation ? "Adaptiert" : "Heimat"} | Diff: ${res.diff}h | Tol: ${res.tolerance}h`);
          } else {
            setIsJetlagged(false);
            setDebugInfo("⚠️ Zeit-API Fehler");
          }
        }
      }
    };
    check();
    return () => { ignore = true; };
  }, [homeLat, homeLon, currentLocation.lat, currentLocation.lon, adaptedLocation]);

  // --- INITIALISIERUNG MIT CRASH-SCHUTZ ---
  React.useEffect(() => {
    const init = async () => {
      try {
        // Notification Berechtigungen beim Start anfragen
        await NotificationService.requestPermissions();

        const data = await StorageService.loadGameData();
        setCount(data.punktestand || 0);
        setLogbook(data.logbook || []);
        
        // Validierung der geladenen UserData
        if (data.userData && typeof data.userData.lat === 'number') {
          setUserData(data.userData);
        }
        
        // KORREKTUR: Entfernen der "Fairness-Logik", damit Vernachlässigung korrekt erkannt wird.
        if (data.activeNeed && data.activeNeed.timestamp) {
          setActiveNeed(data.activeNeed);
          // Notification neu planen falls nötig
          scheduleOverdueNotification(data.activeNeed);
        }

        if (data.adaptedLocation) setAdaptedLocation(data.adaptedLocation);
        
        // Standort laden
        const loc = await LocationService.getCurrentLocationData();
        if (loc.success) {
          setCurrentLocation({ 
            city: loc.city, 
            lat: loc.lat, 
            lon: loc.lon, 
            accuracy: loc.accuracy 
          });
        }
      } catch (err) {
        console.error("Critical Init Error:", err);
      } finally {
        setIsAppReady(true);
      }
    };
    init();
  }, []);

  const generateRandomNeed = React.useCallback(async () => {
    // KORREKTUR: Bedürfnis-Generierung startet nur bei validen Heimatdaten
    if (isSleeping || homeLat === 0 || homeLon === 0) return;
    
    const toolIds = [1, 2, 3, 4, 5];
    const tool = toolIds[Math.floor(Math.random() * toolIds.length)];
    const delay = Math.random() * (Config.NEED_CONFIG.NEXT_NEED_DELAY_MAX - Config.NEED_CONFIG.NEXT_NEED_DELAY_MIN) + Config.NEED_CONFIG.NEXT_NEED_DELAY_MIN;
    
    const trigger = calculateAwakeTrigger(delay);
    const need = { toolId: tool, timestamp: trigger.getTime() };
    
    setActiveNeed(need);
    await StorageService.saveActiveNeed(need);
    
    // Notification für dieses Bedürfnis planen
    scheduleOverdueNotification(need);
  }, [isSleeping, homeLat, homeLon]);

  // Automatischer Start der Bedürfnisse, sobald die App bereit ist und ein Heimatort existiert
  React.useEffect(() => {
    if (isAppReady && !activeNeed && !isSleeping && homeLat !== 0) {
      generateRandomNeed();
    }
  }, [isAppReady, activeNeed, isSleeping, homeLat, generateRandomNeed]);

  // --- INTERAKTION MIT GPS-GUARD ---
  const processInteraction = (toolId) => {
    if (!isAppReady || isSleeping || !isNeedActive || toolId !== activeNeed.toolId) return { success: false };
    
    // GPS-GUARD: Verhindert Exploits durch Null-Koordinaten
    if (currentLocation.lat === 0 || homeLat === 0) {
      showDialog("Standort wird gesucht...", "Mixer braucht einen Moment, um sich zu orientieren. Bitte warte kurz.");
      return { success: false };
    }
    
    const dist = getDistanceFromLatLonInKm(homeLat, homeLon, currentLocation.lat, currentLocation.lon);
    
    const res = calculateEarnedHearts(
      toolId, 
      dist, 
      GameRules.TOOL_BASE_POINTS, 
      GameRules.DISTANCE_THRESHOLDS, 
      activeNeed,
      currentLocation.accuracy
    );
    
    const earned = res.earnedHearts;
    setCount(prev => prev + earned);

    setRewardEvent({ 
      id: Date.now() + Math.random(), 
      amount: Math.abs(earned) || 1, 
      isPenalty: res.isPenalty 
    });

    setLogbook(prev => {
      const idx = prev.findIndex(e => e.city === currentLocation.city);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + earned };
        return next;
      } 
      return [...prev, { id: Date.now().toString(), city: currentLocation.city, count: earned }];
    });

    // Benachrichtigungen löschen, da Bedürfnis erfüllt
    NotificationService.cancelReminders();

    setActiveNeed(null);
    StorageService.saveActiveNeed(null);
    generateRandomNeed();
    
    return { success: true, isAtHome: res.isAtHome, isPenalty: res.isPenalty, earnedHearts: earned };
  };

  return {
    count, logbook, userData, currentLocation, rewardEvent, isAppReady, processInteraction, 
    setUserData: async (d) => {
      // DATEN-INTEGRITÄT: Nur speichern, wenn Koordinaten valide Zahlen sind
      if (d && typeof d.lat === 'number' && d.lat !== 0) {
        setUserData(d);
        await StorageService.saveUserData(d);
        setAdaptedLocation(null);
        await StorageService.saveAdaptedLocation(null);
      } else {
        showDialog("Fehler", "Heimatort konnte nicht korrekt gespeichert werden. Bitte versuche es erneut.");
      }
    },
    resetGame: async () => { 
      await StorageService.resetGameData(); 
      NotificationService.cancelReminders();
      setCount(0); setLogbook([]); setAdaptedLocation(null); setIsJetlagged(false); setActiveNeed(null);
      setUserData({ name: Config.DEFAULT_USERNAME, address: '', lat: 0, lon: 0 });
    }, 
    isSleeping, activeNeed, isNeedActive, isOverdue, isJetlagged, debugInfo,
    activeNeedMessage: (isNeedActive && activeNeed) ? NEED_MESSAGES[activeNeed.toolId] : null
  };
}