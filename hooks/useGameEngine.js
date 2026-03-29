import { useState, useEffect } from 'react';
import { StorageService } from '../services/StorageService';
import { LocationService } from '../services/LocationService';
import { calculateEarnedHearts } from '../utils/gameLogic';
import { getDistanceFromLatLonInKm } from '../utils/locationUtils';
import { GameRules } from '../constants/GameRules';
import { Config } from '../constants/Config';

export function useGameEngine(showDialog) {
  const [count, setCount] = useState(0);
  const [logbook, setLogbook] = useState([]);
  const [userData, setUserData] = useState({ name: Config.DEFAULT_USERNAME, address: 'Suche...', lat: 0, lon: 0 });
  const [currentLocation, setCurrentLocation] = useState({ city: 'Unbekannt', lat: 0, lon: 0 });
  const [rewardEvent, setRewardEvent] = useState({ id: 0, amount: 0 });
  const [isAppReady, setIsAppReady] = useState(false);

  // Initialisierung beim Start
  useEffect(() => {
    const init = async () => {
      let currentUserName = Config.DEFAULT_USERNAME;
      const data = await StorageService.loadGameData();
      setCount(data.punktestand);
      setLogbook(data.logbook);
      
      if (data.userData) {
        setUserData(data.userData);
        currentUserName = data.userData.name || Config.DEFAULT_USERNAME;
      }

      const locResult = await LocationService.getCurrentLocationData();
      if (locResult.success) {
        setCurrentLocation({ city: locResult.city, lat: locResult.lat, lon: locResult.lon });
        if (!data.userData) {
          const p = locResult.rawAddressData;
          const initialData = {
            name: Config.DEFAULT_USERNAME,
            address: `${p.street || ''} ${p.streetNumber || ''}, ${p.postalCode || ''} ${p.city || ''}`.trim(),
            lat: locResult.lat, lon: locResult.lon
          };
          setUserData(initialData);
          await StorageService.saveUserData(initialData);
        }
      }
      setIsAppReady(true);
      showDialog("Willkommen zurück!", `Hallo ${currentUserName}, schön, dass du da bist!`);
    };
    init();
  }, []);

  // Speicher-Sync
  useEffect(() => {
    if (isAppReady) {
      StorageService.savePunktestand(count);
      StorageService.saveLogbook(logbook);
    }
  }, [count, logbook, isAppReady]);

  const processInteraction = (activeTool) => {
    if (currentLocation.city === 'Unbekannt') return false;

    const distance = getDistanceFromLatLonInKm(userData.lat, userData.lon, currentLocation.lat, currentLocation.lon);
    const { earnedHearts, multiplier } = calculateEarnedHearts(activeTool, distance, GameRules.TOOL_BASE_POINTS, GameRules.DISTANCE_THRESHOLDS);

    setCount(prev => prev + earnedHearts);
    setRewardEvent({ id: Date.now(), amount: earnedHearts });

    // Logbuch Logik
    const isHome = userData.address?.toLowerCase().includes(currentLocation.city.toLowerCase());
    const isNewCity = !logbook.some(e => e.city === currentLocation.city);

    if (isNewCity && !isHome) {
      showDialog("Neue Stadt!", multiplier > 1 ? `x${multiplier} Herzen in ${currentLocation.city}!` : `Willkommen in ${currentLocation.city}!`);
    }

    setLogbook(prev => {
      const idx = prev.findIndex(e => e.city === currentLocation.city);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + earnedHearts };
        return next;
      }
      return [...prev, { id: Date.now().toString(), city: currentLocation.city, count: earnedHearts }];
    });
    return true;
  };

  const resetGame = async () => {
    setCount(0);
    setLogbook([]);
    await StorageService.resetGameData();
  };

  return {
    count, logbook, userData, setUserData, currentLocation, rewardEvent, isAppReady, processInteraction, resetGame
  };
}