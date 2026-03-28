import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsModal({ visible, onClose, onSave, currentUserData }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Wenn der Dialog geöffnet wird, laden wir die aktuellen Daten in die Felder
  useEffect(() => {
    if (visible) {
      setName(currentUserData.name);
      setAddress(currentUserData.address);
    }
  }, [visible]);

  const handleSave = async () => {
    // 1. Validierung: Nicht leer lassen
    if (name.trim() === '' || address.trim() === '') {
      Alert.alert('Fehler', 'Name und Adresse dürfen nicht leer sein.');
      return;
    }

    setLoading(true);
    try {
      // 2. Geo-Daten Validierung: Adresse in Koordinaten umwandeln
      let geoResult = await Location.geocodeAsync(address);

      if (geoResult.length > 0) {
        const { latitude, longitude } = geoResult[0];
        
        // Daten-Objekt für den Speicher vorbereiten
        const newData = {
          name: name,
          address: address,
          lat: latitude,
          lon: longitude
        };

        console.log("VERSUCHE ZU SPEICHERN:", JSON.stringify(newData));
        // In AsyncStorage speichern
        await AsyncStorage.setItem('@user_data', JSON.stringify(newData));
        
        console.log("SPEICHERN ERFOLGREICH!");

        // App informieren und schließen
        onSave(newData);
        onClose();
        Alert.alert('Erfolg', 'Profil wurde aktualisiert!');
      } else {
        Alert.alert('Fehler', 'Die Adresse konnte nicht gefunden werden. Bitte prüfe deine Eingabe.');
      }
    } catch (error) {
      console.log("FEHLER BEIM SPEICHERN:", e);
      Alert.alert('Fehler', 'Validierung fehlgeschlagen.');
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
          />

          <Text style={styles.label}>Deine Adresse:</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Straße, Ort..."
            multiline
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={[styles.buttonText, { color: '#fff' }]}>Speichern</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', padding: 20, backgroundColor: '#fff', borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  textArea: { height: 60, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, flex: 1, marginLeft: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8, flex: 1, marginRight: 5, alignItems: 'center' },
  buttonText: { fontWeight: 'bold' }
});