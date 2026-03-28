import React, { useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ImageBackground, Animated } from 'react-native';

export default function InteractiveArea({ onPress, count }) {
  // Wir erstellen einen Animations-Wert, der standardmäßig auf 1 (100% Größe) steht
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Immer wenn sich der Punktestand (count) ändert, spielen wir die Animation ab
  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2, // Bild wird kurz 20% größer
          duration: 150, // Dauer in Millisekunden
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Bild schrumpft zurück auf Normalgröße
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [count]);

  return (
    <ImageBackground 
      source={{ uri: 'https://picsum.photos/id/1015/600/800' }} 
      style={styles.mainArea}
      resizeMode="cover"
    >
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {/* WICHTIG: Statt <Image> nutzen wir hier <Animated.Image> */}
        <Animated.Image 
          source={{ uri: 'https://picsum.photos/id/237/200/200' }} 
          style={[
            styles.interactiveImage,
            { transform: [{ scale: scaleAnim }] } // Hier klinken wir unsere Animation ein
          ]}
        />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  interactiveImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#fff',
  },
});