import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';

import TopBar from './components/TopBar';
import BottomToolbar from './components/BottomToolbar';
import InteractiveArea from './components/InteractiveArea';
import SettingsModal from './components/SettingsModal';
import DiscoveryModal from './components/DiscoveryModal';
import InfoDialog from './components/InfoDialog'; 
import QuestionModal from './components/QuestionModal';

import { Theme } from './constants/Theme';
import { useGameEngine } from './hooks/useGameEngine';
import { NotificationService } from './services/NotificationService';

export default function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isQuestionVisible, setQuestionVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '' });
  const [mixerSpeech, setMixerSpeech] = useState(null);

  const showDialog = (title, message) => setDialogConfig({ visible: true, title, message });
  const engine = useGameEngine(showDialog);

  useEffect(() => {
    // Nur noch Berechtigungen beim Start anfordern
    NotificationService.requestPermissions();
  }, []);

  const handleSelectTool = (toolId) => {
    if (engine.isSleeping) return; 
    
    if (engine.isNeedActive && toolId !== engine.activeNeed.toolId) {
      showDialog("Mixer sagt:", "Das brauche ich gerade nicht! Schau mal, was ich wirklich will.");
      return;
    }

    if (toolId === 5) {
      setQuestionVisible(true);
    } else {
      setActiveTool(toolId);
    }
  };

  const handleDialogueSelection = (dialogueItem) => {
    if (!engine.isNeedActive) return;
    setMixerSpeech(dialogueItem.answer);
    engine.processInteraction(5); 
    setTimeout(() => setMixerSpeech(null), 4000);
  };

  const handleAction = () => {
    if (engine.isSleeping || !activeTool) return;
    const result = engine.processInteraction(activeTool);
    if (result.success) {
      setActiveTool(null);
      if (result.isAtHome) {
        setMixerSpeech("Ich bin doch bei dir, du kannst dich direkt um mich kümmern!");
        setTimeout(() => setMixerSpeech(null), 4000);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Theme.colors.background }]}>
      <TopBar count={engine.count} onOpenSettings={() => setSettingsVisible(true)} onOpenInfo={() => setInfoVisible(true)} />
      
      <InteractiveArea 
        rewardEvent={engine.rewardEvent} 
        onApplyTool={handleAction} 
        activeTool={activeTool} 
        currentSpeech={mixerSpeech} 
        activeNeed={engine.activeNeed} 
        isNeedActive={engine.isNeedActive} 
      />
      
      <BottomToolbar activeTool={activeTool} onSelectTool={handleSelectTool} activeNeed={engine.activeNeed} isNeedActive={engine.isNeedActive} />
      
      {engine.isSleeping && (
        <View style={styles.nightLock}>
          <Text style={styles.nightText}>Mixer schläft gerade... 💤</Text>
        </View>
      )}

      <QuestionModal visible={isQuestionVisible} onClose={() => setQuestionVisible(false)} onSelectQuestion={handleDialogueSelection} />
      <SettingsModal visible={isSettingsVisible} currentUserData={engine.userData} onClose={() => setSettingsVisible(false)} onSave={engine.setUserData} showDialog={showDialog} onReset={() => { engine.resetGame(); setSettingsVisible(false); showDialog("Reset", "Alles auf Null!"); }} />
      <DiscoveryModal visible={isInfoVisible} onClose={() => setInfoVisible(false)} logbookData={engine.logbook} />
      <InfoDialog visible={dialogConfig.visible} title={dialogConfig.title} message={dialogConfig.message} onClose={() => setDialogConfig({ ...dialogConfig, visible: false })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1 },
  nightLock: { ...StyleSheet.absoluteFillObject, backgroundColor: Theme.colors.nightOverlay, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  nightText: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.modalYellow, textAlign: 'center', paddingHorizontal: 30 }
});