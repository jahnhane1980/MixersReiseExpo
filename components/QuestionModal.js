import React, { useState } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, Platform } from 'react-native'; // Platform hinzugefügt
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../constants/Theme';
import { Dialogues } from '../constants/Dialogues';

export default function QuestionModal({ visible, onClose, onSelectQuestion }) {
  const [selectedValue, setSelectedValue] = useState('1');

  const handleConfirm = () => {
    const selectedDialogue = Dialogues.find(d => d.id === selectedValue);
    if (selectedDialogue && selectedDialogue.points > 0) {
      onSelectQuestion(selectedDialogue);
      onClose();
      setSelectedValue('1'); // Reset
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Frage an Mixer</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(itemValue) => setSelectedValue(itemValue)}
              style={styles.picker}
            >
              {Dialogues.map((d) => (
                <Picker.Item key={d.id} label={d.question} value={d.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, selectedValue === '1' && styles.disabledButton]} 
              onPress={handleConfirm}
              disabled={selectedValue === '1'}
            >
              <Text style={styles.confirmButtonText}>Fragen</Text>
            </TouchableOpacity>
          </View>
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
    width: '85%',
    padding: Theme.spacing.large,
    backgroundColor: Theme.colors.modalYellow,
    borderRadius: Theme.borderRadius.large,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.primaryBrown,
    marginBottom: Theme.spacing.medium,
    textAlign: 'center',
  },
  pickerContainer: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.small,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: Theme.spacing.large,
    // FIX für iOS: Das Rad braucht deutlich mehr Platz und darf nicht abgeschnitten werden.
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
    height: Platform.OS === 'ios' ? 220 : 50,
  },
  picker: {
    width: '100%',
    // FIX für iOS: Die innere Komponente bekommt ebenfalls den nötigen Platz
    height: Platform.OS === 'ios' ? 210 : 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Theme.colors.primaryBrown,
    padding: 12,
    borderRadius: Theme.borderRadius.small,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Theme.colors.borderLight,
  },
  buttonText: {
    color: Theme.colors.primaryBrown,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
  },
});