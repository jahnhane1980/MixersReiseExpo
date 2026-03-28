import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Alle Bausteine an Bord
import TopBar from './components/TopBar';
import BottomToolbar from './components/BottomToolbar';
import InteractiveArea from './components/InteractiveArea';
import SettingsModal from './components/SettingsModal';
import DiscoveryModal from './components/DiscoveryModal';


export default function App() {
  const [count, setCount] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [userData, setUserData] = useState({ name: 'Entdecker', address: 'Suche...', lat: 0, lon: 0 });

  // Init-Logik
  useEffect(() => {
    const initialize = async () => {
      const savedCount = await AsyncStorage.getItem('@punktestand');
      if (savedCount) setCount(parseInt(savedCount, 10));

      const savedUser = await AsyncStorage.getItem('@user_data');
      console.log("ROHDATEN AUS SPEICHER:", savedUser); // Schau im Log-Reiter nach!

      if (savedUser) {
        console.log("Saved user");
        setUserData(JSON.parse(savedUser));
      } else {
        console.log("KEINE DATEN GEFUNDEN - STARTE GPS-SUCHE");
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          let geo = await Location.reverseGeocodeAsync(loc.coords);
          if (geo.length > 0) {
            const p = geo[0];
            const data = {
              name: 'Entdecker',
              address: `${p.street || ''} ${p.streetNumber || ''}, ${p.postalCode || ''} ${p.city || ''}`.trim(),
              lat: loc.coords.latitude, lon: loc.coords.longitude
            };
            setUserData(data);
            await AsyncStorage.setItem('@user_data', JSON.stringify(data));
          }
        }
      }
    };
    initialize();
  }, []);

  // Score-Speicherung
  useEffect(() => {
    AsyncStorage.setItem('@punktestand', count.toString());
  }, [count]);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar 
        count={count} 
        onOpenSettings={() => setSettingsVisible(true)} 
        onOpenInfo={() => setInfoVisible(true)} 
      />

      <InteractiveArea count={count} onPress={() => activeTool ? setCount(c => c + 1) : Alert.alert("Tool wählen!")} />

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
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }
});