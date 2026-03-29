import React from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function DiscoveryModal({ visible, onClose, logbookData }) {
  
  // Wir sortieren die Daten absteigend nach der Anzahl der gesammelten Herzen
  const sortedData = [...(logbookData || [])].sort((a, b) => b.count - a.count);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Entdecker-Logbuch</Text>
          
          <ScrollView style={styles.tableContainer}>
            {sortedData.length === 0 ? (
              <Text style={styles.emptyText}>Du hast noch keine Orte entdeckt. Reise los und sammle Herzen!</Text>
            ) : (
              sortedData.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.columnLeft}>
                    <Text style={styles.cellTextBold}>{item.count}</Text>
                  </View>
                  <View style={styles.columnRight}>
                    <Text style={styles.cellText}>{item.city}</Text>
                  </View>
                </View>
              ))
            )}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    padding: 20,
    backgroundColor: '#fff9c4', 
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4e342e',
  },
  tableContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', 
    borderRadius: 12,
    padding: 10, 
  },
  emptyText: {
    color: '#4e342e',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0d8a4', 
    paddingVertical: 12,
  },
  columnLeft: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0d8a4',
  },
  columnRight: {
    flex: 2,
    alignItems: 'flex-start',
    paddingLeft: 15,
  },
  cellText: {
    fontSize: 16,
    color: '#4e342e',
  },
  cellTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4e342e',
  },
  closeButton: {
    backgroundColor: '#4e342e',
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