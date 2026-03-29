import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopBar({ count, onOpenSettings, onOpenInfo }) {
  // Zentrale Text- und Icon-Farbe (auf Braun gut lesbar)
  const textColor = '#fff9c4';

  // Animated.Value für die Puls-Animation des Herzens
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Ref, um den vorherigen Punktestand zu speichern
  const prevCount = useRef(count);

  // useEffect, der nur läuft, wenn sich 'count' ändert
  useEffect(() => {
    // Wir pulsieren nur, wenn ein Herz *hinzugefügt* wurde
    if (count > prevCount.current) {
      // Start der Puls-Sequenz (Schnell größer, etwas langsamer zurück)
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4, // Kurz 40% größer
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, // Zurück zur Normalgröße
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
    // Den aktuellen count für den nächsten Vergleich speichern
    prevCount.current = count;
  }, [count, pulseAnim]);

  return (
    <View style={styles.topBar}>
      {/* Container für den Herz-Counter */}
      <View style={styles.heartCounter}>
        
        {/* WICHTIG: Das Schatten-Herz für Tiefe */}
        {/* Wir legen ein dunkleres Herz leicht versetzt darunter */}
        <Ionicons name="heart" size={28} color="#c0392b" style={styles.heartShadow} />
        
        {/* Das pulsierende Haupt-Herz (#FF5252) */}
        <Animated.View style={[styles.pulsingHeart, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="heart" size={28} color="#FF5252" />
        </Animated.View>

        <Text style={styles.counterText}>{count}</Text>
      </View>

      <View style={styles.topBarIcons}>
        <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenInfo} style={styles.iconButton}>
          <Ionicons name="earth-outline" size={28} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#8d6e63', 
    borderBottomWidth: 1,
    borderBottomColor: '#5d4037', 
    elevation: 5, // Ein kleiner Schatten unter der gesamten Leiste
  },
  heartCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', // Nötig für das absolute Schatten-Herz
  },
  pulsingHeart: {
    // Container für das pulsierende Herz
  },
  heartShadow: {
    // Das Schatten-Herz wird absolut über dem Haupt-Herz platziert, 
    // aber um 2 Pixel nach unten/rechts versetzt.
    position: 'absolute',
    top: 2, 
    left: 2, 
    opacity: 0.7, // Etwas transparenter
  },
  counterText: {
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#fff9c4',
    marginLeft: 8, // Abstand zu den stacked Herzen
  },
  topBarIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
});