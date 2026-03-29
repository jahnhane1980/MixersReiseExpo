import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

// Importe für Services und Theme
import { Theme } from '../constants/Theme';
import { LocationService } from '../services/LocationService'; // NEU
import { StorageService } from '../services/StorageService'; // NEU

export default function SettingsModal({ visible, onClose, onSave, currentUserData, showDialog, onReset }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(currentUserData.name);
      setAddress(currentUserData.address);
    }
  }, [visible]);

  const handleSave = async () => {
    if (name.trim() === '' || address.trim() === '') {
      showDialog('Fehler', 'Name und Adresse dürfen nicht leer sein.');
      return;
    }

    setLoading(true);
    try {
      // NEU: Adress-Validierung über den LocationService
      const geoResult = await LocationService.getCoordinatesFromAddress(address);

      if (geoResult.success) {
        const newData = {
          name: name,
          address: address,
          lat: geoResult.lat,
          lon: geoResult.lon
        };

        // NEU: Speichern über den StorageService
        await StorageService.saveUserData(newData);
        
        onSave(newData);
        onClose();
        showDialog('Erfolg', 'Profil wurde aktualisiert!');
      } else {
        showDialog('Fehler', 'Die Adresse konnte nicht gefunden werden.');
      }
    } catch (error) {
      showDialog('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Profil-Einstellungen</Text>

          <Text style={styles.label}>Dein Name:</Text>
          <TextInput 
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name eingeben..."
            placeholderTextColor={Theme.colors.textPlaceholder}
          />

          <Text style={styles.label}>Deine Adresse:</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Straße, Ort..."
            placeholderTextColor={Theme.colors.textPlaceholder}
            multiline
          />

          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primaryBrown} />
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonTextLight}>Speichern</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.dangerZone}>
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.buttonTextLight}>Spielstand zurücksetzen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.overlayDark },
  modalContent: { width: '85%', padding: Theme.spacing.large, backgroundColor: Theme.colors.modalYellow, borderRadius: Theme.borderRadius.medium, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: Theme.spacing.large, textAlign: 'center', color: Theme.colors.primaryBrown },
  label: { fontSize: 14, color: Theme.colors.primaryBrown, marginBottom: Theme.spacing.xs, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: Theme.colors.borderLight, borderRadius: Theme.borderRadius.small, padding: Theme.spacing.small, marginBottom: Theme.spacing.medium, fontSize: 16, color: Theme.colors.primaryBrown, backgroundColor: Theme.colors.white },
  textArea: { height: 60, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Theme.spacing.small },
  saveButton: { backgroundColor: Theme.colors.primaryBrown, padding: 12, borderRadius: Theme.borderRadius.small, flex: 1, marginLeft: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: Theme.colors.cancelButton, padding: 12, borderRadius: Theme.borderRadius.small, flex: 1, marginRight: 5, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', color: Theme.colors.primaryBrown },
  buttonTextLight: { fontWeight: 'bold', color: Theme.colors.white },
  dangerZone: { marginTop: 30, borderTopWidth: 1, borderTopColor: Theme.colors.borderLight, paddingTop: Theme.spacing.medium },
  resetButton: { backgroundColor: Theme.colors.dangerRed, padding: 12, borderRadius: Theme.borderRadius.small, alignItems: 'center' }
});