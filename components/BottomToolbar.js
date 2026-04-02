import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Theme } from '../constants/Theme';

export default function BottomToolbar({ activeTool, onSelectTool, activeNeed, isNeedActive, isSleeping }) {
  const tools = [
    { id: 1, image: require('../assets/tool_food.png') },
    { id: 2, image: require('../assets/tool_coke.png') },
    { id: 3, image: require('../assets/tool_hand.png') },
    { id: 4, image: require('../assets/tool_sponge.png') },
    { id: 5, image: require('../assets/tool_talk.png') },
  ];

  return (
    <View style={styles.bottomToolbar}>
      {tools.map((tool) => {
        const isSelected = activeTool === tool.id;
        const isNeeded = isNeedActive && activeNeed?.toolId === tool.id;
        
        // KORREKTUR: Ein Tool ist "inaktiv" (grau), wenn es nicht gebraucht wird 
        // UND nicht gerade vom User ausgewählt wurde.
        const isInactive = !isNeeded && !isSelected;
        const isDisabled = isSleeping;

        return (
          <TouchableOpacity 
            key={tool.id} 
            disabled={isDisabled}
            style={[
              styles.toolButton, 
              isSelected && styles.activeToolButton,
              isInactive && styles.inactiveToolButton,
              isNeeded && styles.neededToolButton,
              isDisabled && styles.disabledToolButton 
            ]}
            onPress={() => onSelectTool(tool.id)}
          >
            <Image 
              source={tool.image} 
              style={[
                styles.toolImage, 
                isInactive && styles.inactiveImage,
                isDisabled && styles.disabledImage
              ]} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomToolbar: { 
    height: 80, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    backgroundColor: Theme.colors.background, 
    borderTopWidth: 1, 
    borderTopColor: Theme.colors.toolbarBorder 
  },
  toolButton: { 
    width: 50, 
    height: 50, 
    borderRadius: Theme.borderRadius.roundButton, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Theme.colors.white, 
    elevation: 3 
  },
  activeToolButton: { backgroundColor: Theme.colors.activeTool, elevation: 5 },
  neededToolButton: { borderColor: Theme.colors.activeTool, borderWidth: 2, backgroundColor: '#FFF9C4' },
  // NEU: Style für inaktive (ausgegraute) Buttons
  inactiveToolButton: { backgroundColor: '#f5f5f5', opacity: 0.6, elevation: 0 },
  disabledToolButton: { backgroundColor: '#e0e0e0', opacity: 0.3 },
  toolImage: { width: 28, height: 28, resizeMode: 'contain' },
  // NEU: Graufilter für inaktive Icons
  inactiveImage: { tintColor: 'gray' },
  disabledImage: { tintColor: 'darkgray' }
});