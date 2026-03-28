import React from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function DiscoveryModal({ visible, onClose }) {
  // Mock-Daten für die Tabelle
  const discoveryData = [
    { id: 1, count: 124, city: 'Berlin' },
    { id: 2, count: 89, city: 'Paris' },
    { id: 3, count: 256, city: 'Tokio' },
    { id: 4, count: 42, city: 'New York' },
    { id: 5, count: 177, city: 'Würzburg' },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Entdecker-Logbuch</Text>
          
          <ScrollView style={styles.tableContainer}>
            {discoveryData.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.columnLeft}>
                  <Text style={styles.cellTextBold}>{item.count}</Text>
                </View>
                <View style={styles.columnRight}>
                  <Text style={styles.cellText}>{item.city}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Schließen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Etwas dunkler für mehr Fokus
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  tableContainer: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  columnLeft: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  columnRight: {
    flex: 2,
    alignItems: 'flex-start',
  },
  cellText: {
    fontSize: 16,
    color: '#34495e',
  },
  cellTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});