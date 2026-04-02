import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Config } from './constants/Config';
import { useGameEngine } from './hooks/useGameEngine';
import InteractiveArea from './components/InteractiveArea';
import BottomToolbar from './components/BottomToolbar';
import TopBar from './components/TopBar';
import SettingsModal from './components/SettingsModal';
import QuestionModal from './components/QuestionModal';

export default function App() {
  const [mixerSpeech, setMixerSpeech] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isQuestionVisible, setQuestionVisible] = useState(false);

  const engine = useGameEngine();

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

  return (
    <SafeAreaView style={styles.container}>
      <TopBar count={engine.count} onOpenSettings={() => setSettingsVisible(true)} />
      <InteractiveArea 
        rewardEvent={engine.rewardEvent} onApplyTool={handleAction} activeTool={activeTool} 
        currentSpeech={mixerSpeech} activeNeed={engine.activeNeed} isNeedActive={engine.isNeedActive} 
        isSleeping={engine.isSleeping} isJetlagged={engine.isJetlagged}
      />
      <BottomToolbar activeTool={activeTool} onSelectTool={setActiveTool} activeNeed={engine.activeNeed} isNeedActive={engine.isNeedActive} />
      <SettingsModal visible={isSettingsVisible} currentUserData={engine.userData} onClose={() => setSettingsVisible(false)} onSave={engine.setUserData} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#FFF' } });