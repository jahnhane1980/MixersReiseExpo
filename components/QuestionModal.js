import React, { useState } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Theme } from '../constants/Theme';
import { Dialogues } from '../constants/Dialogues';

export default function QuestionModal({ visible, onClose, onSelectQuestion }) {
  const [selectedValue, setSelectedValue] = useState('1');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // NEU: Steuert, ob die Liste offen ist

  // Finde den aktuell ausgewählten Text für den Dropdown-Header
  const selectedLabel = Dialogues.find(d => d.id === selectedValue)?.question || "Frage auswählen...";

  const handleConfirm = () => {
    const selectedDialogue = Dialogues.find(d => d.id === selectedValue);
    if (selectedDialogue && selectedDialogue.points > 0) {
      onSelectQuestion(selectedDialogue);
      handleClose(); // Reset und Schließen
    }
  };

  const handleClose = () => {
    setIsDropdownOpen(false);
    setSelectedValue('1');
    onClose();
  };

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.dropdownItem, 
        selectedValue === item.id && styles.dropdownItemSelected
      ]}
      onPress={() => {
        setSelectedValue(item.id);
        setIsDropdownOpen(false); // Schließt die Liste nach Auswahl
      }}
    >
      <Text style={[
        styles.dropdownItemText,
        selectedValue === item.id && styles.dropdownItemTextSelected
      ]}>
        {item.question}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Frage an Mixer</Text>
          
          {/* UNSERE CUSTOM SELECTBOX */}
          <View style={styles.customPickerContainer}>
            {/* Der anklickbare Header (sieht aus wie ein Input) */}
            <TouchableOpacity 
              style={styles.pickerHeader} 
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerHeaderText}>{selectedLabel}</Text>
              <Text style={styles.dropdownIcon}>{isDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Die ausklappbare Liste */}
            {isDropdownOpen && (
              <View style={styles.dropdownListContainer}>
                <FlatList
                  data={Dialogues}
                  keyExtractor={(item) => item.id}
                  renderItem={renderDropdownItem}
                  style={styles.dropdownList}
                  showsVerticalScrollIndicator={true}
                />
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
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
  // --- NEUE STYLES FÜR DIE CUSTOM SELECTBOX ---
  customPickerContainer: {
    marginBottom: Theme.spacing.large,
    zIndex: 10, // Wichtig, damit das Dropdown über anderen Elementen liegt
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: Theme.borderRadius.small,
    paddingHorizontal: 15,
    height: 50,
  },
  pickerHeaderText: {
    color: Theme.colors.primaryBrown,
    fontSize: 16,
    flex: 1, // Damit langer Text abgeschnitten wird und nicht den Pfeil verschiebt
  },
  dropdownIcon: {
    color: Theme.colors.primaryBrown,
    fontSize: 14,
    marginLeft: 10,
  },
  dropdownListContainer: {
    position: 'absolute',
    top: 55, // Direkt unter dem Header
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: Theme.borderRadius.small,
    maxHeight: 180, // Limitiert die Höhe, danach wird gescrollt
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 20,
  },
  dropdownList: {
    width: '100%',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // Sehr helles Grau zur Trennung
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(101, 67, 33, 0.1)', // Leichtes Braun als Highlight
  },
  dropdownItemText: {
    color: Theme.colors.primaryBrown,
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    fontWeight: 'bold',
  },
  // --------------------------------------------
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1, // Knöpfe müssen unter dem Dropdown bleiben
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