import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert, View } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TopBar from './components/TopBar';
import BottomToolbar from './components/BottomToolbar';
import InteractiveArea from './components/InteractiveArea';
import SettingsModal from './components/SettingsModal';
import DiscoveryModal from './components/DiscoveryModal';

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
  
  const [userData, setUserData] = useState({ name: 'Entdecker', address: 'Suche...', lat: 0, lon: 0 });
  const [currentLocation, setCurrentLocation] = useState({ city: 'Unbekannt', lat: 0, lon: 0 });
  const [logbook, setLogbook] = useState([]);
  const [rewardEvent, setRewardEvent] = useState({ id: 0, amount: 0 });

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedCount = await AsyncStorage.getItem('@punktestand');
        if (savedCount) setCount(parseInt(savedCount, 10));

        const savedLogbook = await AsyncStorage.getItem('@logbook');
        if (savedLogbook) setLogbook(JSON.parse(savedLogbook));

        const savedUser = await AsyncStorage.getItem('@user_data');
        if (savedUser) setUserData(JSON.parse(savedUser));

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
            }
          }
        }
      } catch (e) {
        console.error("Fehler im Init:", e);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@punktestand', count.toString());
  }, [count]);

  useEffect(() => {
    AsyncStorage.setItem('@logbook', JSON.stringify(logbook));
  }, [logbook]);

  // Diese Funktion wird jetzt erst aufgerufen, NACHDEM das Drag&Drop fertig ist
  const handleMainImagePress = () => {
    if (activeTool === null) return;

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

    const cityExists = logbook.find(entry => entry.city === currentLocation.city);
    
    if (!cityExists) {
      if (multiplier > 1) {
        Alert.alert(
          "Neue Stadt entdeckt! 🌍", 
          `Hey, du bist in ${currentLocation.city} und bekommst x${multiplier} Herzen für jede Aktion!`
        );
      } else {
        Alert.alert(
          "Neue Stadt entdeckt! 🌍", 
          `Willkommen in ${currentLocation.city}! Fange an, hier Herzen zu sammeln.`
        );
      }
    }

    setLogbook(prevLogbook => {
      if (cityExists) {
        return prevLogbook.map(entry => 
          entry.city === currentLocation.city 
            ? { ...entry, count: entry.count + earnedHearts } 
            : entry
        );
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
        activeTool={activeTool} // NEU: Damit die Area weiß, welches Bild sie rendern muss
      />

      <BottomToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      <SettingsModal 
        visible={isSettingsVisible} 
        currentUserData={userData} 
        onClose={() => setSettingsVisible(false)} 
        onSave={setUserData} 
      />

      <DiscoveryModal 
        visible={isInfoVisible} 
        onClose={() => setInfoVisible(false)} 
        logbookData={logbook} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8d6e63' } 
});