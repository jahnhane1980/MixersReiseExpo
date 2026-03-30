import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Theme } from '../constants/Theme';

export default function BottomToolbar({ activeTool, onSelectTool, activeNeed, isNeedActive }) {
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
        // Deaktiviert, wenn kein Bedürfnis aktiv ist ODER es das falsche Tool ist
        const isDisabled = !isNeedActive || activeNeed?.toolId !== tool.id;

        return (
          <TouchableOpacity 
            key={tool.id} 
            disabled={isDisabled}
            style={[
              styles.toolButton, 
              activeTool === tool.id && styles.activeToolButton,
              isDisabled && styles.disabledToolButton 
            ]}
            onPress={() => onSelectTool(tool.id)}
          >
            <Image 
              source={tool.image} 
              style={[styles.toolImage, isDisabled && styles.disabledImage]} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomToolbar: { height: 80, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: Theme.colors.background, borderTopWidth: 1, borderTopColor: Theme.colors.toolbarBorder },
  toolButton: { width: 50, height: 50, borderRadius: Theme.borderRadius.roundButton, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.white, elevation: 3 },
  activeToolButton: { backgroundColor: Theme.colors.activeTool },
  disabledToolButton: { backgroundColor: '#e0e0e0', opacity: 0.5 },
  toolImage: { width: 28, height: 28, resizeMode: 'contain' },
  disabledImage: { tintColor: 'gray' }
});