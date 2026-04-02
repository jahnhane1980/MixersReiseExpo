import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, Animated, Easing } from 'react-native';
import { Theme } from '../constants/Theme';

export default function HeartParticle({ id, isPenalty, onComplete }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const randomXOffset = useRef((Math.random() - 0.5) * 80).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      // FIX: Schwarze Herzen fliegen jetzt 50% langsamer für mehr Dramatik!
      duration: isPenalty ? Theme.animations.heartParticleDuration * 1.5 : Theme.animations.heartParticleDuration, 
      easing: Easing.out(Easing.quad), 
      useNativeDriver: true,
    }).start(() => onComplete(id));
  }, []);

  // Harter Fade-Out am Ende für den Zerschell-Effekt bei Strafen
  const opacity = animValue.interpolate({
    // FIX: Bleibt länger voll sichtbar (bis 0.95 statt 0.9)
    inputRange: [0, 0.7, 0.95, 1],
    outputRange: [1, 0.8, isPenalty ? 0.8 : 0.5, 0] 
  });

  // Zerschellen: Er bleibt länger groß und platzt dann im allerletzten Moment
  const transform = [
    { translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, Theme.layout.particleSpawnY] }) },
    { translateX: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -60 + randomXOffset] }) },
    { scale: animValue.interpolate({ 
        // FIX: Der Drop auf 0 passiert erst ab 95% der Animationszeit
        inputRange: [0, 0.95, 1], 
        outputRange: [1, isPenalty ? 2 : 1.5, isPenalty ? 0 : 1.5] 
      }) 
    }
  ];

  return (
    <Animated.View style={[styles.heartParticle, { opacity, transform }]}>
      <Text style={{ fontSize: 22 }}>{isPenalty ? '🖤' : '❤️'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heartParticle: { position: 'absolute' }
});