import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, Animated, Easing } from 'react-native';
import { Theme } from '../constants/Theme';

export default function HeartParticle({ id, onComplete }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const randomXOffset = useRef((Math.random() - 0.5) * 80).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: Theme.animations.heartParticleDuration, 
      easing: Easing.out(Easing.quad), 
      useNativeDriver: true,
    }).start(() => onComplete(id));
  }, []);

  const opacity = animValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.8, 0] 
  });

  const transform = [
    { translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, Theme.layout.particleSpawnY] }) },
    { translateX: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -60 + randomXOffset] }) },
    { scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }
  ];

  return (
    <Animated.View style={[styles.heartParticle, { opacity, transform }]}>
      <Text style={{ fontSize: 22 }}>❤️</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heartParticle: { position: 'absolute' }
});