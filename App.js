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
import DiscoveryModal from './components/DiscoveryModal';

export default function App() {
  const [interactionSpeech, setInteractionSpeech] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isQuestionVisible, setQuestionVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '' });

  const showDialog = (title, message) => setDialogConfig({ visible: true, title, message });
  const engine = useGameEngine(showDialog);

  const getSpeechText = () => {
    if (interactionSpeech) return interactionSpeech; 
    
    if (Config.DEBUG_MODE) {
      const need = engine.activeNeed ? `Need: ${engine.activeNeed.toolId} (${engine.isNeedActive ? 'AKTIV' : 'WARTET'})` : 'Need: keines';
      return `Jetlag: ${engine.isJetlagged ? 'JA' : 'NEIN'} | Schlaf: ${engine.isSleeping ? 'JA' : 'NEIN'}\n${need}\n${engine.debugInfo}`;
    }

    if (engine.isSleeping) return null; 
    if (engine.isJetlagged) return "Uff, mir brummt der Kopf! 😵‍💫";
    if (engine.isNeedActive && engine.activeNeedMessage) return engine.activeNeedMessage;
    
    if (!engine.isNeedActive && engine.isAppReady) {
      return "Ich ruhe mich gerade aus... 😊";
    }
    
    return null;
  };

  const handleAction = () => {
    if (activeTool) {
      const res = engine.processInteraction(activeTool);
      if (res.success) {
        setActiveTool(null);
        setInteractionSpeech(res.isPenalty ? "Das hat aber lange gedauert... 😢" : "Danke schön! ✨");
        setTimeout(() => setInteractionSpeech(null), 5000);
      } else {
        // KORREKTUR: Ablehnung der Anwendung in Ruhephasen
        setActiveTool(null);
        if (!engine.isNeedActive) {
          setInteractionSpeech("Das ist lieb, aber ich bin gerade wunschlos glücklich! 😊");
        } else {
          setInteractionSpeech("Das brauche ich gerade nicht! 🐴");
        }
        setTimeout(() => setInteractionSpeech(null), 4000);
      }
    }
  };

  const handleSelectTool = (id) => {
    if (engine.isSleeping) return;
    
    if (id === 5) {
      // Spezielle Logik für das Gesprächs-Tool
      if (engine.isNeedActive && engine.activeNeed.toolId === 5) {
        setQuestionVisible(true);
      } else {
        setInteractionSpeech("Ich möchte gerade lieber nicht reden. 😊");
        setTimeout(() => setInteractionSpeech(null), 3000);
      }
    } else {
      setActiveTool(id);
    }
  };

  const handleDialogueSelection = (item) => {
    const res = engine.processInteraction(5);
    if (res.success) {
      setQuestionVisible(false);
      setInteractionSpeech(res.isPenalty ? "Das hat aber lange gedauert... 😢" : item.answer);
      setTimeout(() => setInteractionSpeech(null), 6000);
    }
  };

  const needsAddress = engine.userData.lat === 0 && engine.userData.lon === 0;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar count={engine.count} onOpenSettings={() => setSettingsVisible(true)} onOpenInfo={() => setInfoVisible(true)} />
      <InteractiveArea 
        rewardEvent={engine.rewardEvent} 
        onApplyTool={handleAction} 
        activeTool={activeTool} 
        currentSpeech={getSpeechText()} 
        activeNeed={engine.activeNeed} 
        isNeedActive={engine.isNeedActive} 
        isSleeping={engine.isSleeping} 
        isJetlagged={engine.isJetlagged}
        isOverdue={engine.isOverdue} 
      />
      <BottomToolbar 
        activeTool={activeTool} 
        onSelectTool={handleSelectTool} 
        activeNeed={engine.activeNeed} 
        isNeedActive={engine.isNeedActive} 
        isSleeping={engine.isSleeping}
      />
      
      {needsAddress && !isSettingsVisible && engine.isAppReady && (
        <View style={styles.addressLock}>
          <Text style={styles.addressLockTitle}>🏠 Willkommen!</Text>
          <Text style={styles.addressLockText}>Bevor das Abenteuer losgeht, musst du Mixer zeigen, wo sein Zuhause ist.</Text>
          <TouchableOpacity style={styles.openSettingsBtn} onPress={() => setSettingsVisible(true)}>
            <Text style={styles.openSettingsBtnText}>Heimatort eintragen</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <DiscoveryModal visible={isInfoVisible} onClose={() => setInfoVisible(false)} logbookData={engine.logbook} />
      <SettingsModal visible={isSettingsVisible} currentUserData={engine.userData} onClose={() => setSettingsVisible(false)} onSave={engine.setUserData} showDialog={showDialog} onReset={() => { engine.resetGame(); setSettingsVisible(false); showDialog("Reset", "Alles auf Null gesetzt!"); }} />
      <QuestionModal visible={isQuestionVisible} onClose={() => setQuestionVisible(false)} onSelectQuestion={handleDialogueSelection} />
      <InfoDialog visible={dialogConfig.visible} title={dialogConfig.title} message={dialogConfig.message} onClose={() => setDialogConfig({ ...dialogConfig, visible: false })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#FFF' },
  addressLock: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 247, 212, 0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: 30 },
  addressLockTitle: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.primaryBrown, marginBottom: 15, textAlign: 'center' },
  addressLockText: { fontSize: 18, color: Theme.colors.primaryBrown, textAlign: 'center', marginBottom: 35, lineHeight: 26 },
  openSettingsBtn: { backgroundColor: Theme.colors.primaryBrown, paddingVertical: 15, paddingHorizontal: 35, borderRadius: 30, elevation: 5 },
  openSettingsBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});