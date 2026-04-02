import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Config } from './constants/Config';
import { Theme } from './constants/Theme';
import { useGameEngine } from './hooks/useGameEngine';
import InteractiveArea from './components/InteractiveArea';
import BottomToolbar from './components/BottomToolbar';
import TopBar from './components/TopBar';
import SettingsModal from './components/SettingsModal';
import QuestionModal from './components/QuestionModal';
import InfoDialog from './components/InfoDialog'; 

export default function App() {
  const [mixerSpeech, setMixerSpeech] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isQuestionVisible, setQuestionVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '' });

  const showDialog = (title, message) => setDialogConfig({ visible: true, title, message });
  const engine = useGameEngine(showDialog);

  // DEBUG-ANZEIGE: Zeigt wichtige Zustände live in der Sprechblase
  useEffect(() => {
    if (Config.DEBUG_MODE) {
      const info = `Jetlag: ${engine.isJetlagged ? 'JA' : 'NEIN'}\nSchlaf: ${engine.isSleeping ? 'JA' : 'NEIN'}\n${engine.debugInfo}`;
      setMixerSpeech(info);
    } else if (engine.isJetlagged) {
      setMixerSpeech("Uff, mir brummt der Kopf! 😵‍💫");
    }
  }, [engine.isJetlagged, engine.isSleeping, engine.debugInfo]);

  const handleAction = () => {
    if (activeTool) {
      const res = engine.processInteraction(activeTool);
      if (res.success) setActiveTool(null);
    }
  };

  const needsAddress = engine.userData.lat === 0 && engine.userData.lon === 0;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar count={engine.count} onOpenSettings={() => setSettingsVisible(true)} />
      
      <InteractiveArea 
        rewardEvent={engine.rewardEvent} onApplyTool={handleAction} activeTool={activeTool} 
        currentSpeech={mixerSpeech} activeNeed={engine.activeNeed} isNeedActive={engine.isNeedActive} 
        isSleeping={engine.isSleeping} isJetlagged={engine.isJetlagged}
      />
      
      <BottomToolbar activeTool={activeTool} onSelectTool={setActiveTool} activeNeed={engine.activeNeed} isNeedActive={engine.isNeedActive} />

      {/* FIX: Willkommens-Sperre wieder eingebaut */}
      {needsAddress && !isSettingsVisible && engine.isAppReady && (
        <View style={styles.addressLock}>
          <Text style={styles.addressLockTitle}>🏠 Willkommen!</Text>
          <Text style={styles.addressLockText}>Bevor das Abenteuer losgeht, musst du Mixer zeigen, wo sein Zuhause ist. Sonst verläuft er sich!</Text>
          <TouchableOpacity style={styles.openSettingsBtn} onPress={() => setSettingsVisible(true)}>
            <Text style={styles.openSettingsBtnText}>Heimatort eintragen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FIX: Props onReset und showDialog an SettingsModal übergeben */}
      <SettingsModal 
        visible={isSettingsVisible} 
        currentUserData={engine.userData} 
        onClose={() => setSettingsVisible(false)} 
        onSave={engine.setUserData}
        showDialog={showDialog}
        onReset={() => {
          engine.resetGame();
          setSettingsVisible(false);
          showDialog("Reset", "Alles auf Null gesetzt!");
        }}
      />

      <QuestionModal visible={isQuestionVisible} onClose={() => setQuestionVisible(false)} />
      
      <InfoDialog 
        visible={dialogConfig.visible} 
        title={dialogConfig.title} 
        message={dialogConfig.message} 
        onClose={() => setDialogConfig({ ...dialogConfig, visible: false })} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#FFF' },
  addressLock: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255, 247, 212, 0.95)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2000, 
    padding: 30 
  },
  addressLockTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: Theme.colors.primaryBrown, 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  addressLockText: { 
    fontSize: 18, 
    color: Theme.colors.primaryBrown, 
    textAlign: 'center', 
    marginBottom: 35, 
    lineHeight: 26 
  },
  openSettingsBtn: { 
    backgroundColor: Theme.colors.primaryBrown, 
    paddingVertical: 15, 
    paddingHorizontal: 35, 
    borderRadius: 30, 
    elevation: 5 
  },
  openSettingsBtnText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
});