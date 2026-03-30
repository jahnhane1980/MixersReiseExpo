import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, Image, View, Animated, Text } from 'react-native';
import { Theme } from '../constants/Theme';
import { usePlushieAnimation } from '../hooks/usePlushieAnimation';
import HeartParticle from './HeartParticle';

const toolImages = {
  1: require('../assets/tool_food.png'),
  2: require('../assets/tool_coke.png'),
  3: require('../assets/tool_hand.png'),
  4: require('../assets/tool_sponge.png'),
  5: require('../assets/tool_talk.png'),
};

export default function InteractiveArea({ onApplyTool, rewardEvent, activeTool, currentSpeech }) {
  const [heartList, setHeartList] = useState([]);
  const prevEventId = useRef(rewardEvent?.id || 0);

  const { panHandlers, pan, snapScale, plushieScale, plushieOpacity } = usePlushieAnimation(onApplyTool);

  useEffect(() => {
    if (rewardEvent && rewardEvent.id !== prevEventId.current && rewardEvent.amount > 0) {
      const spawnCount = Math.min(rewardEvent.amount, 30);
      const heartsToAdd = Array.from({ length: spawnCount }).map((_, i) => ({ id: `${rewardEvent.id}-${i}` }));
      setHeartList((prev) => [...prev, ...heartsToAdd]);
      prevEventId.current = rewardEvent.id;
    }
  }, [rewardEvent]);

  return (
    <ImageBackground 
      source={require('../assets/bg_bedroom_plushies.png')} 
      style={styles.mainArea}
      resizeMode="cover" 
      imageStyle={{ transform: [{ scale: 1.3 }] }} 
    >
      {/* NEU: Die Sprechblase */}
      {currentSpeech && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{currentSpeech}</Text>
          <View style={styles.bubbleTail} />
        </View>
      )}

      <View style={styles.plushieContainer}>
        <Animated.Image 
          source={require('../assets/mixer_idle.png')} 
          style={[styles.plushieImage, { transform: [{ scale: plushieScale }], opacity: plushieOpacity }]}
          resizeMode="contain" 
        />
        
        <View style={styles.particleLayer}>
          {heartList.map((heart) => (
            <HeartParticle key={heart.id} id={heart.id} onComplete={(id) => setHeartList(prev => prev.filter(h => h.id !== id))} />
          ))}
        </View>
      </View>

      {activeTool && (
        <Animated.View
          {...panHandlers}
          style={[styles.draggableTool, { transform: [...pan.getTranslateTransform(), { scale: snapScale }] }]}
        >
          <Image source={toolImages[activeTool]} style={styles.toolIcon} />
        </Animated.View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainArea: { flex: 1, alignItems: 'center', width: '100%', overflow: 'hidden' },
  speechBubble: {
    position: 'absolute',
    top: 180,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    maxWidth: '80%',
    borderWidth: 2,
    borderColor: Theme.colors.primaryBrown,
    zIndex: 20,
    elevation: 5,
  },
  speechText: {
    color: Theme.colors.primaryBrown,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Theme.colors.primaryBrown,
  },
  plushieContainer: { marginTop: 320, position: 'relative' },
  plushieImage: { width: Theme.layout.plushieWidth, height: Theme.layout.plushieHeight },
  particleLayer: { position: 'absolute', top: -50, left: 80, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  draggableTool: { position: 'absolute', bottom: 10, left: '50%', marginLeft: -(Theme.layout.toolIconSize / 2), zIndex: 10 },
  toolIcon: { width: Theme.layout.toolIconSize, height: Theme.layout.toolIconSize, resizeMode: 'contain' }
});