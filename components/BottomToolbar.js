import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';

// NEU: Importiere das Theme
import { Theme } from '../constants/Theme';

export default function BottomToolbar({ activeTool, onSelectTool }) {
  const tools = [
    { id: 1, image: require('../assets/tool_food.png'), name: 'Essen' },
    { id: 2, image: require('../assets/tool_coke.png'), name: 'Trinken' },
    { id: 3, image: require('../assets/tool_hand.png'), name: 'Streicheln' },
    { id: 4, image: require('../assets/tool_sponge.png'), name: 'Schwamm' },
    { id: 5, image: require('../assets/tool_talk.png'), name: 'Sprechblase' },
  ];

  return (
    <View style={styles.bottomToolbar}>
      {tools.map((tool) => (
        <TouchableOpacity 
          key={tool.id} 
          style={[
            styles.toolButton, 
            activeTool === tool.id && styles.activeToolButton 
          ]}
          onPress={() => onSelectTool(tool.id)}
        >
          <Image 
            source={tool.image} 
            style={styles.toolImage} 
          />
        </TouchableOpacity>
      ))}
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
    borderTopColor: Theme.colors.toolbarBorder, 
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.roundButton,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activeToolButton: {
    backgroundColor: Theme.colors.activeTool, 
  },
  toolImage: {
    width: 28, 
    height: 28,
    resizeMode: 'contain', 
  }
});