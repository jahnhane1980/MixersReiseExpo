import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Theme } from '../constants/Theme';

export default function HeartParticle({ id, isPenalty, onComplete }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => onComplete(id));
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Theme.layout.particleSpawnY || -280],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.5, 1.2, 1],
  });

  return (
    <Animated.Text style={[styles.particle, { transform: [{ translateY }, { scale }], opacity }]}>
      {isPenalty ? '💔' : '❤️'}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  particle: { position: 'absolute', fontSize: 24, zIndex: 100 }
});