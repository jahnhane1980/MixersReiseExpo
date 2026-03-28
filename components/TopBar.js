import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopBar({ count, onOpenSettings, onOpenInfo }) {
  return (
    <View style={styles.topBar}>
      <Text style={styles.counterText}>Punkte: {count}</Text>
      <View style={styles.topBarIcons}>
        <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenInfo} style={styles.iconButton}>
          <Ionicons name="earth-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  topBarIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
});