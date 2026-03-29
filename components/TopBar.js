import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme'; // NEU

export default function TopBar({ count, onOpenSettings, onOpenInfo }) {
  const textColor = Theme.colors.modalYellow; // NEU

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4, 
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, 
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
    prevCount.current = count;
  }, [count, pulseAnim]);

  return (
    <View style={styles.topBar}>
      <View style={styles.heartCounter}>
        <Ionicons name="heart" size={28} color="#c0392b" style={styles.heartShadow} />
        
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
    paddingHorizontal: Theme.spacing.large, // NEU
    backgroundColor: Theme.colors.background, // NEU
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.toolbarBorder, // NEU
    elevation: 5, 
  },
  heartCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', 
  },
  pulsingHeart: {
  },
  heartShadow: {
    position: 'absolute',
    top: 2, 
    left: 2, 
    opacity: 0.7, 
  },
  counterText: {
    fontSize: 22, 
    fontWeight: 'bold',
    color: Theme.colors.modalYellow, // NEU
    marginLeft: 8, 
  },
  topBarIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: Theme.spacing.medium, // NEU
  },
});