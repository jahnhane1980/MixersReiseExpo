import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Theme } from '../constants/Theme';
import { LocationService } from '../services/LocationService'; 
import { StorageService } from '../services/StorageService'; 

export default function SettingsModal({ visible, onClose, onSave, currentUserData, showDialog, onReset }) {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(currentUserData.name || '');
      // Adresse parsen
      const parts = currentUserData.address ? currentUserData.address.split(', ') : [];
      if(parts.length >= 2) {
         setStreet(parts[0]);
         const zipCity = parts[1].split(' ');
         setZip(zipCity[0] || '');
         setCity(zipCity.slice(1).join(' ') || '');
      } else {
         setStreet(currentUserData.address || '');
      }
    }
  }, [visible, currentUserData]);

  // NEU: Aktuellen GPS-Standort laden und Felder befüllen
  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const locResult = await LocationService.getCurrentLocationData();
      if (locResult.success && locResult.rawAddressData) {
        const addr = locResult.rawAddressData;
        const streetName = addr.street || '';
        const streetNum = addr.streetNumber || '';
        
        setStreet(`${streetName} ${streetNum}`.trim());
        setZip(addr.postalCode || '');
        setCity(addr.city || addr.subregion || '');
      } else {
        showDialog('Fehler', 'Dein aktueller Standort konnte nicht ermittelt werden. Sind die Ortungsdienste an?');
      }
    } catch (error) {
      showDialog('Fehler', 'Ein Fehler bei der Standortabfrage ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !street.trim() || !zip.trim() || !city.trim()) {
      showDialog('Fehler', 'Bitte fülle alle Felder (Name, Straße, PLZ, Ort) aus.');
      return;
    }

    setLoading(true);
    const fullAddress = `${street.trim()}, ${zip.trim()} ${city.trim()}`;
    
    try {
      const geoResult = await LocationService.getCoordinatesFromAddress(fullAddress);

      if (geoResult.success && (geoResult.lat !== 0 || geoResult.lon !== 0)) {
        const newData = {
          name: name,
          address: fullAddress,
          lat: geoResult.lat,
          lon: geoResult.lon
        };

        await StorageService.saveUserData(newData);
        onSave(newData);
        onClose();
        showDialog('Erfolg', 'Heimatort erfolgreich gesichert! Das Abenteuer kann beginnen.');
      } else {
        showDialog('Fehler', 'Die Adresse konnte nicht auf der Karte gefunden werden. Bitte überprüfe deine Eingabe (Tippfehler bei PLZ/Ort?).');
      }
    } catch (error) {
      showDialog('Fehler', 'Ein Netzwerkfehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Profil & Zuhause</Text>

          <Text style={styles.label}>Dein Name:</Text>
          <TextInput 
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name eingeben..."
            placeholderTextColor={Theme.colors.textPlaceholder}
          />

          {/* NEU: Header-Reihe mit Auto-Fill Button */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Dein Heimatort:</Text>
            <TouchableOpacity style={styles.gpsButton} onPress={handleUseCurrentLocation}>
              <Text style={styles.gpsButtonText}>📍 GPS nutzen</Text>
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.input}
            value={street}
            onChangeText={setStreet}
            placeholder="Straße & Hausnummer"
            placeholderTextColor={Theme.colors.textPlaceholder}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <TextInput 
                style={styles.input}
                value={zip}
                onChangeText={setZip}
                placeholder="PLZ"
                keyboardType="numeric"
                placeholderTextColor={Theme.colors.textPlaceholder}
              />
            </View>
            <View style={styles.halfWidth}>
              <TextInput 
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Ort"
                placeholderTextColor={Theme.colors.textPlaceholder}
              />
            </View>
          </View>

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
  modalContent: { width: '90%', padding: Theme.spacing.large, backgroundColor: Theme.colors.modalYellow, borderRadius: Theme.borderRadius.medium, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: Theme.spacing.large, textAlign: 'center', color: Theme.colors.primaryBrown },
  // Neue Styles für die Label-Zeile mit dem Button
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.xs },
  gpsButton: { backgroundColor: 'rgba(101, 67, 33, 0.1)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15 },
  gpsButtonText: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.primaryBrown },
  label: { fontSize: 14, color: Theme.colors.primaryBrown, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: Theme.colors.borderLight, borderRadius: Theme.borderRadius.small, padding: Theme.spacing.small, marginBottom: Theme.spacing.medium, fontSize: 16, color: Theme.colors.primaryBrown, backgroundColor: Theme.colors.white },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Theme.spacing.small },
  saveButton: { backgroundColor: Theme.colors.primaryBrown, padding: 12, borderRadius: Theme.borderRadius.small, flex: 1, marginLeft: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: Theme.colors.cancelButton, padding: 12, borderRadius: Theme.borderRadius.small, flex: 1, marginRight: 5, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', color: Theme.colors.primaryBrown },
  buttonTextLight: { fontWeight: 'bold', color: Theme.colors.white },
  dangerZone: { marginTop: 25, borderTopWidth: 1, borderTopColor: Theme.colors.borderLight, paddingTop: Theme.spacing.medium },
  resetButton: { backgroundColor: Theme.colors.dangerRed, padding: 12, borderRadius: Theme.borderRadius.small, alignItems: 'center' }
});