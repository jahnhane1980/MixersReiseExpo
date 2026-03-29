import React from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';

// NEU: Importiere das Theme
import { Theme } from '../constants/Theme';

export default function InfoDialog({ visible, title, message, onClose, buttonText = "Alles klar!" }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {title ? <Text style={styles.modalTitle}>{title}</Text> : null}
          
          <Text style={styles.modalText}>{message}</Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{buttonText}</Text>
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
    backgroundColor: Theme.colors.overlayDark, 
  },
  modalContent: {
    width: '80%',
    padding: Theme.spacing.xlarge,
    backgroundColor: Theme.colors.modalYellow, 
    borderRadius: Theme.borderRadius.large,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.primaryBrown,
    marginBottom: Theme.spacing.medium,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: Theme.colors.primaryBrown,
    textAlign: 'center',
    marginBottom: Theme.spacing.xlarge,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: Theme.colors.primaryBrown,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: Theme.borderRadius.small,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});