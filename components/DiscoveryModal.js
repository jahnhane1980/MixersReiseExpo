import React from 'react';
import { 
  StyleSheet, View, Text, Modal, TouchableOpacity, 
  FlatList, ImageBackground, Dimensions 
} from 'react-native';
import { Theme } from '../constants/Theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoveryModal({ visible, onClose, logbookData }) {
  // TEST-DATEN: 20 Einträge zum Scroll-Check
  const testData = Array.from({ length: 20 }, (_, i) => ({
    id: `test-${i}`,
    city: 'Chicago',
    count: 0
  }));

  const displayData = [...(logbookData || []), ...testData];

  const renderItem = ({ item }) => (
    <View style={styles.logEntry}>
      <Text style={styles.cityText}>📍 {item.city}</Text>
      <Text style={styles.pointsText}>{item.count} ❤️</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* HINTERGRUND: DIE WELTKARTE */}
          <ImageBackground 
            source={require('../assets/bg_world_map.png')} 
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* STICKY HEADER (Fester Titel) */}
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Entdecker-Logbuch</Text>
              <View style={styles.titleLine} />
            </View>
            
            <FlatList
              data={displayData}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.scrollArea}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={true}
            />

            {/* STICKY FOOTER (Fester Button mit hoher Deckkraft) */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Abenteuer fortsetzen</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    height: '92%',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Theme.colors.primaryBrown,
    backgroundColor: '#fff', 
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    backgroundColor: 'rgba(255, 247, 212, 0.9)', // Passendes Gelb-Overlay oben
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primaryBrown,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.primaryBrown,
    letterSpacing: 1,
  },
  titleLine: {
    height: 4,
    backgroundColor: Theme.colors.primaryBrown,
    width: 80,
    marginTop: 6,
    borderRadius: 2,
  },
  scrollArea: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 130, // Puffer für den massiveren Footer-Bereich
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Noch weißer für Kontrast zur Karte
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  pointsText: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.primaryBrown,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 35, // Etwas mehr Platz nach unten
    paddingTop: 15,
    alignItems: 'center',
    // HOHE DECKKRAFT FÜR DAS GOLD-FINISH
    backgroundColor: 'rgba(255, 247, 212, 0.85)', 
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    backgroundColor: Theme.colors.primaryBrown,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 35,
    elevation: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});