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

  useEffect(() => {
    if (visible) {
      setName(currentUserData.name);
      setAddress(currentUserData.address);
    }
  }, [visible]);

  const handleSave = async () => {
    if (name.trim() === '' || address.trim() === '') {
      Alert.alert('Fehler', 'Name und Adresse dürfen nicht leer sein.');
      return;
    }

    setLoading(true);
    try {
      let geoResult = await Location.geocodeAsync(address);

      if (geoResult.length > 0) {
        const { latitude, longitude } = geoResult[0];
        
        const newData = {
          name: name,
          address: address,
          lat: latitude,
          lon: longitude
        };

        await AsyncStorage.setItem('@user_data', JSON.stringify(newData));
        
        onSave(newData);
        onClose();
        Alert.alert('Erfolg', 'Profil wurde aktualisiert!');
      } else {
        Alert.alert('Fehler', 'Die Adresse konnte nicht gefunden werden. Bitte prüfe deine Eingabe.');
      }
    } catch (error) {
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
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Deine Adresse:</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Straße, Ort..."
            placeholderTextColor="#999"
            multiline
          />

          {loading ? (
            <ActivityIndicator size="large" color="#4e342e" />
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
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width: '85%', 
    padding: 20, 
    backgroundColor: '#fff9c4', // Auf Gelb gesetzt
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#4e342e'
  },
  label: { 
    fontSize: 14, 
    color: '#4e342e', 
    marginBottom: 5,
    fontWeight: '600'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 15, 
    fontSize: 16,
    color: '#4e342e',
    backgroundColor: '#fff', // Weißer Hintergrund für die Eingabefelder sieht auf Gelb besser aus
  },
  textArea: { 
    height: 60, 
    textAlignVertical: 'top' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  saveButton: { 
    backgroundColor: '#4e342e', 
    padding: 12, 
    borderRadius: 8, 
    flex: 1, 
    marginLeft: 5, 
    alignItems: 'center' 
  },
  cancelButton: { 
    backgroundColor: '#eee', 
    padding: 12, 
    borderRadius: 8, 
    flex: 1, 
    marginRight: 5, 
    alignItems: 'center' 
  },
  buttonText: { 
    fontWeight: 'bold',
    color: '#4e342e'
  },
  buttonTextLight: { 
    fontWeight: 'bold',
    color: '#fff'
  }
});