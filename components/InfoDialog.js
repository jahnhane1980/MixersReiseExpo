import React from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';

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
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  modalContent: {
    width: '80%',
    padding: 25,
    backgroundColor: '#fff9c4', 
    borderRadius: 20,
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
    // Hier ist unser gewünschtes Dunkelbraun für den Titel
    color: '#4e342e',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    // Und hier für den normalen Text
    color: '#4e342e',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#4e342e',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});