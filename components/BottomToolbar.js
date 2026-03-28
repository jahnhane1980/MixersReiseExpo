import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
// ACHTUNG: Wir importieren jetzt MaterialCommunityIcons statt Ionicons!
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BottomToolbar({ activeTool, onSelectTool }) {
  // Hier ist die neue Liste mit deinen Wunsch-Icons
  const tools = [
    { id: 1, icon: 'food-apple', name: 'Essen' },         // Ein Apfel (Alternativen: 'food-drumstick', 'bowl')
    { id: 2, icon: 'cup-water', name: 'Trinken' },        // Ein Wasserglas
    { id: 3, icon: 'hand-heart', name: 'Streicheln' },    // Eine Hand mit einem Herz
    { id: 4, icon: 'sponge', name: 'Schwamm' },           // Ein Schwamm
    { id: 5, icon: 'chat-outline', name: 'Sprechblase' }, // Eine Sprechblase
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
          {/* Die Komponente heißt jetzt entsprechend MaterialCommunityIcons */}
          <MaterialCommunityIcons 
            name={tool.icon} 
            size={26} // Minimal größer gemacht, da diese Icons oft feiner sind
            color={activeTool === tool.id ? '#fff' : '#333'} 
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
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingBottom: 20, 
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activeToolButton: {
    backgroundColor: '#007AFF', 
  },
});