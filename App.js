import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TopBar from './components/TopBar';
import BottomToolbar from './components/BottomToolbar';
import InteractiveArea from './components/InteractiveArea';
import SettingsModal from './components/SettingsModal';
import DiscoveryModal from './components/DiscoveryModal';
import InfoDialog from './components/InfoDialog'; 

// --- HILFSFUNKTIONEN ---
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
};

const TOOL_BASE_POINTS = {
  1: 5,  
  2: 10, 
  3: 10, 
  4: 15, 
  5: 20  
};

export default function App() {
  const [count, setCount] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '' });
  
  const [userData, setUserData] = useState({ name: 'Entdecker', address: 'Suche...', lat: 0, lon: 0 });
  const [currentLocation, setCurrentLocation] = useState({ city: 'Unbekannt', lat: 0, lon: 0 });
  const [logbook, setLogbook] = useState([]);
  const [rewardEvent, setRewardEvent] = useState({ id: 0, amount: 0 });

  const [isAppReady, setIsAppReady] = useState(false);

  const showDialog = (title, message) => {
    setDialogConfig({ visible: true, title, message });
  };

  useEffect(() => {
    const initialize = async () => {
      let currentUserName = 'Entdecker'; // NEU: Wir merken uns den Namen für die Begrüßung

      try {
        const savedCount = await AsyncStorage.getItem('@punktestand');
        if (savedCount) setCount(parseInt(savedCount, 10));

        const savedLogbook = await AsyncStorage.getItem('@logbook');
        if (savedLogbook) setLogbook(JSON.parse(savedLogbook));

        const savedUser = await AsyncStorage.getItem('@user_data');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUserData(parsedUser);
          if (parsedUser.name) currentUserName = parsedUser.name; // Namen übernehmen
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          let geo = await Location.reverseGeocodeAsync(loc.coords);
          
          if (geo.length > 0) {
            const currentCity = geo[0].city || geo[0].subregion || 'Unbekannter Ort';
            setCurrentLocation({
              city: currentCity,
              lat: loc.coords.latitude,
              lon: loc.coords.longitude
            });

            if (!savedUser) {
              const p = geo[0];
              const autoAddress = `${p.street || ''} ${p.streetNumber || ''}, ${p.postalCode || ''} ${p.city || ''}`.trim();
              const initialData = {
                name: 'Entdecker',
                address: autoAddress,
                lat: loc.coords.latitude, 
                lon: loc.coords.longitude
              };
              setUserData(initialData);
              await AsyncStorage.setItem('@user_data', JSON.stringify(initialData));
              currentUserName = 'Entdecker';
            }
          }
        }
      } catch (e) {
        console.error("Fehler im Init:", e);
      } finally {
        setIsAppReady(true);
        // NEU: Begrüßung abfeuern, sobald alles geladen ist!
        showDialog("Willkommen zurück!", `Hallo ${currentUserName}, schön, dass du da bist!`);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      AsyncStorage.setItem('@punktestand', count.toString());
    }
  }, [count, isAppReady]);

  useEffect(() => {
    if (isAppReady) {
      AsyncStorage.setItem('@logbook', JSON.stringify(logbook));
    }
  }, [logbook, isAppReady]);

  const handleResetData = async () => {
    setCount(0);
    setLogbook([]);
    await AsyncStorage.removeItem('@punktestand');
    await AsyncStorage.removeItem('@logbook');
    setSettingsVisible(false);
    showDialog("Erledigt", "Alle gesammelten Herzen und das Logbuch wurden erfolgreich zurückgesetzt!");
  };

  const handleMainImagePress = () => {
    if (activeTool === null) {
      showDialog("Hinweis", "Bitte wähle zuerst unten ein Tool aus!");
      return;
    }

    if (currentLocation.city === 'Unbekannt') {
      showDialog("GPS lädt noch 🛰️", "Dein Standort wird noch ermittelt oder GPS ist blockiert. Bitte warte einen kurzen Moment!");
      return; 
    }

    const basePoints = TOOL_BASE_POINTS[activeTool] || 0;

    const distance = getDistanceFromLatLonInKm(
      userData.lat, userData.lon, 
      currentLocation.lat, currentLocation.lon
    );

    let multiplier = 1;
    if (distance >= 750) multiplier = 10;
    else if (distance >= 500) multiplier = 5;
    else if (distance >= 250) multiplier = 2;

    const earnedHearts = basePoints * multiplier;

    setCount(prev => prev + earnedHearts);
    setRewardEvent({ id: Date.now(), amount: earnedHearts });

    const isHomeCity = userData.address && currentLocation.city 
      ? userData.address.toLowerCase().includes(currentLocation.city.toLowerCase()) 
      : false;
    
    const cityAlreadyInLogbook = logbook.some(entry => entry.city === currentLocation.city);
    
    if (!cityAlreadyInLogbook && !isHomeCity) {
      if (multiplier > 1) {
        showDialog("Neue Stadt entdeckt! 🌍", `Hey, du bist in ${currentLocation.city} und bekommst x${multiplier} Herzen für jede Aktion!`);
      } else {
        showDialog("Neue Stadt entdeckt! 🌍", `Willkommen in ${currentLocation.city}! Fange an, hier Herzen zu sammeln.`);
      }
    }

    setLogbook(prevLogbook => {
      const existingIndex = prevLogbook.findIndex(entry => entry.city === currentLocation.city);
      
      if (existingIndex >= 0) {
        const newLogbook = [...prevLogbook];
        newLogbook[existingIndex] = {
          ...newLogbook[existingIndex],
          count: newLogbook[existingIndex].count + earnedHearts
        };
        return newLogbook;
      } else {
        return [...prevLogbook, { id: Date.now().toString(), city: currentLocation.city, count: earnedHearts }];
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar 
        count={count} 
        onOpenSettings={() => setSettingsVisible(true)} 
        onOpenInfo={() => setInfoVisible(true)} 
      />

      <InteractiveArea 
        rewardEvent={rewardEvent} 
        onApplyTool={handleMainImagePress} 
        activeTool={activeTool} 
      />

      <BottomToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      <SettingsModal 
        visible={isSettingsVisible} 
        currentUserData={userData} 
        onClose={() => setSettingsVisible(false)} 
        onSave={setUserData} 
        showDialog={showDialog} 
        onReset={handleResetData}
      />

      <DiscoveryModal 
        visible={isInfoVisible} 
        onClose={() => setInfoVisible(false)} 
        logbookData={logbook} 
      />

      <InfoDialog 
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={() => setDialogConfig({ ...dialogConfig, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8d6e63' } 
});