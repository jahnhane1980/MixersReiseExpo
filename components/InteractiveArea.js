import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, Image, View, Text, Animated, Easing, PanResponder } from 'react-native';

const toolImages = {
  1: require('../assets/tool_food.png'),
  2: require('../assets/tool_coke.png'),
  3: require('../assets/tool_hand.png'),
  4: require('../assets/tool_sponge.png'),
  5: require('../assets/tool_talk.png'),
};

const HeartParticle = ({ id, onComplete }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1200, 
      easing: Easing.out(Easing.quad), 
      useNativeDriver: true,
    }).start(() => {
      onComplete(id);
    });
  }, [animValue, onComplete, id]);

  const opacity = animValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.8, 0] 
  });

  const randomXOffset = useRef((Math.random() - 0.5) * 80).current;

  const transform = [
    { translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -280] }) },
    { translateX: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -60 + randomXOffset] }) },
    { scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }
  ];

  return (
    <Animated.View style={[styles.heartParticle, { opacity, transform }]}>
      <Text style={styles.heartText}>❤️</Text>
    </Animated.View>
  );
};

export default function InteractiveArea({ onPress, onApplyTool, rewardEvent, activeTool }) {
  const [heartList, setHeartList] = useState([]);
  const prevEventId = useRef(rewardEvent.id);

  // --- NEU: Der "Briefkasten" für die aktuellsten Funktionen ---
  const callbacksRef = useRef({ onPress, onApplyTool });
  useEffect(() => {
    // Wird bei jedem Render aktualisiert, so haben wir immer die frischesten Daten
    callbacksRef.current = { onPress, onApplyTool };
  }, [onPress, onApplyTool]);

  // --- DRAG & DROP REFS ---
  const pan = useRef(new Animated.ValueXY()).current;
  const toolOpacity = useRef(new Animated.Value(1)).current;
  const isApplyingRef = useRef(false); 

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isApplyingRef.current,
      onMoveShouldSetPanResponder: () => !isApplyingRef.current,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false } 
      ),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        
        // Check: Weit genug nach oben gezogen?
        if (gesture.dy < -100) {
          isApplyingRef.current = true; 
          
          setTimeout(() => {
            Animated.timing(toolOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }).start(() => {
              
              // HIER GREIFEN WIR JETZT IN DEN BRIEFKASTEN!
              const currentOnPress = callbacksRef.current.onPress;
              const currentOnApplyTool = callbacksRef.current.onApplyTool;
              
              if (currentOnPress) currentOnPress();
              else if (currentOnApplyTool) currentOnApplyTool();
              
              pan.setValue({ x: 0, y: 0 });
              toolOpacity.setValue(1);
              isApplyingRef.current = false;
            });
          }, 3000); 

        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const removeHeart = (id) => {
    setHeartList((prev) => prev.filter((heart) => heart.id !== id));
  };

  useEffect(() => {
    if (rewardEvent && rewardEvent.id !== prevEventId.current && rewardEvent.amount > 0) {
      const spawnCount = Math.min(rewardEvent.amount, 30);
      const heartsToAdd = Array.from({ length: spawnCount }).map((_, i) => ({
        id: `${rewardEvent.id}-${i}`
      }));
      setHeartList((prev) => [...prev, ...heartsToAdd]);
      prevEventId.current = rewardEvent.id;
    }
  }, [rewardEvent]);

  return (
    <ImageBackground 
      source={require('../assets/bg_bedroom_plushies.png')} 
      style={styles.mainArea}
      resizeMode="cover" 
      imageStyle={styles.backgroundImageZoom} 
    >
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/mixer_idle.png')} 
          style={styles.interactiveImage}
          resizeMode="contain" 
        />
        
        <View style={styles.particleLayer}>
          {heartList.map((heart) => (
            <HeartParticle 
              key={heart.id} 
              id={heart.id} 
              onComplete={removeHeart} 
            />
          ))}
        </View>
      </View>

      {/* DRAG & DROP LAYER */}
      {activeTool && toolImages[activeTool] && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.draggableToolContainer,
            { 
              opacity: toolOpacity,
              transform: pan.getTranslateTransform() 
            } 
          ]}
        >
          <Image 
            source={toolImages[activeTool]} 
            style={styles.draggableImage} 
          />
        </Animated.View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainArea: {
    flex: 1,
    alignItems: 'center', 
    width: '100%',
    margin: 0,
    padding: 0,
    overflow: 'hidden', 
  },
  backgroundImageZoom: {
    transform: [{ scale: 1.3 }], 
  },
  imageContainer: {
    marginTop: 320, 
    position: 'relative', 
  },
  interactiveImage: {
    width: 200,
    height: 300, 
    borderRadius: 0, 
    elevation: 0, 
  },
  particleLayer: {
    position: 'absolute',
    top: -50, 
    left: 80, 
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartParticle: {
    position: 'absolute', 
  },
  heartText: {
    fontSize: 22, 
  },
  draggableToolContainer: {
    position: 'absolute',
    bottom: 50, 
    left: '50%', 
    marginLeft: -38, 
    zIndex: 10,
    elevation: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 38, 
  },
  draggableImage: {
    width: 56,  
    height: 56,
    resizeMode: 'contain', 
    tintColor: '#4e342e', 
  }
});