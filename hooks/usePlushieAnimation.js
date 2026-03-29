import { useRef, useEffect } from 'react';
import { Animated, PanResponder } from 'react-native';
import { Theme } from '../constants/Theme';

export function usePlushieAnimation(onApplyTool) {
  const pan = useRef(new Animated.ValueXY()).current;
  const snapScale = useRef(new Animated.Value(1)).current;
  const plushieReactAnim = useRef(new Animated.Value(0)).current;
  const isApplyingRef = useRef(false);

  // NEU: Wir halten die onApplyTool Funktion immer aktuell
  const onApplyToolRef = useRef(onApplyTool);
  useEffect(() => {
    onApplyToolRef.current = onApplyTool;
  }, [onApplyTool]);

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
        
        if (gesture.dy < -100) {
          isApplyingRef.current = true;
          
          Animated.parallel([
            Animated.sequence([
              Animated.timing(snapScale, { toValue: 1.4, duration: Theme.animations.toolSnapDuration, useNativeDriver: false }),
              Animated.spring(snapScale, { toValue: 1, friction: 4, useNativeDriver: false })
            ]),
            Animated.timing(plushieReactAnim, { toValue: 1, duration: Theme.animations.plushieReactDuration, useNativeDriver: false })
          ]).start();
          
          setTimeout(() => {
            Animated.parallel([
              Animated.spring(pan, { toValue: { x: 0, y: 0 }, tension: 40, friction: 6, useNativeDriver: false }),
              Animated.timing(plushieReactAnim, { toValue: 0, duration: 300, useNativeDriver: false })
            ]).start(() => {
              // FIX: Nutze die Ref statt der direkten Prop
              if (onApplyToolRef.current) onApplyToolRef.current();
              isApplyingRef.current = false;
            });
          }, Theme.animations.interactionResetDelay); 

        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const plushieScale = plushieReactAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95]
  });
  
  const plushieOpacity = plushieReactAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6]
  });

  return {
    panHandlers: panResponder.panHandlers,
    pan,
    snapScale,
    plushieScale,
    plushieOpacity
  };
}