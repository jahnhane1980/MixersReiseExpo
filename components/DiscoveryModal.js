import React from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../constants/Theme'; // NEU

export default function DiscoveryModal({ visible, onClose, logbookData }) {
  
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
    backgroundColor: Theme.colors.overlayDark, // NEU
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    padding: Theme.spacing.large, // NEU
    backgroundColor: Theme.colors.modalYellow, // NEU
    borderRadius: Theme.borderRadius.large, // NEU
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.large, // NEU
    color: Theme.colors.primaryBrown, // NEU
  },
  tableContainer: {
    width: '100%',
    marginBottom: Theme.spacing.large, // NEU
    backgroundColor: Theme.colors.overlayLight, // NEU
    borderRadius: 12,
    padding: Theme.spacing.small, // NEU
  },
  emptyText: {
    color: Theme.colors.primaryBrown, // NEU
    textAlign: 'center',
    fontStyle: 'italic',
    padding: Theme.spacing.small, // NEU
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.toolbarBorder, // NEU
    paddingVertical: 12,
  },
  columnLeft: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: Theme.spacing.small, // NEU
    borderRightWidth: 1,
    borderRightColor: Theme.colors.toolbarBorder, // NEU
  },
  columnRight: {
    flex: 2,
    alignItems: 'flex-start',
    paddingLeft: Theme.spacing.medium, // NEU
  },
  cellText: {
    fontSize: 16,
    color: Theme.colors.primaryBrown, // NEU
  },
  cellTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.primaryBrown, // NEU
  },
  closeButton: {
    backgroundColor: Theme.colors.primaryBrown, // NEU
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: Theme.borderRadius.small, // NEU
  },
  closeButtonText: {
    color: Theme.colors.white, // NEU
    fontWeight: 'bold',
    fontSize: 16,
  },
});