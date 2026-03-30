import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Theme } from '../constants/Theme';

export default function DiscoveryModal({ visible, onClose, logbookData }) {
  // Eine Zeile im Logbuch rendern
  const renderItem = ({ item }) => (
    <View style={styles.logEntry}>
      <Text style={styles.cityText}>📍 {item.city}</Text>
      <Text style={styles.pointsText}>{item.count} ❤️</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Entdecker-Logbuch</Text>
          
          {logbookData && logbookData.length > 0 ? (
            <FlatList
              data={logbookData}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.listStyle}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Noch keine Entdeckungen gemacht...</Text>
            </View>
          )}

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    height: '70%', // Feste Höhe, damit die Liste scrollen muss
    backgroundColor: Theme.colors.modalYellow,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.primaryBrown,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.primaryBrown,
    marginBottom: 20,
  },
  listStyle: {
    width: '100%',
  },
  listContainer: {
    paddingBottom: 20,
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.toolbarBorder,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primaryBrown,
  },
  pointsText: {
    fontSize: 16,
    color: Theme.colors.primaryBrown,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontStyle: 'italic',
    color: 'gray',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: Theme.colors.primaryBrown,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});