import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import TopBar from './components/TopBar';
import BottomToolbar from './components/BottomToolbar';
import InteractiveArea from './components/InteractiveArea';
import SettingsModal from './components/SettingsModal';
import DiscoveryModal from './components/DiscoveryModal';
import InfoDialog from './components/InfoDialog'; 
import QuestionModal from './components/QuestionModal'; // NEU

import { Theme } from './constants/Theme';
import { useGameEngine } from './hooks/useGameEngine';

export default function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isQuestionVisible, setQuestionVisible] = useState(false); // NEU
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '' });
  const [mixerSpeech, setMixerSpeech] = useState(null); // NEU: Steuert den Text in InteractiveArea

  const showDialog = (title, message) => setDialogConfig({ visible: true, title, message });

  const engine = useGameEngine(showDialog);

  // Angepasster Handler für die Tool-Auswahl
  const handleSelectTool = (toolId) => {
    if (toolId === 5) {
      // Wenn Sprechblase gewählt wird: Modal öffnen
      setQuestionVisible(true);
    } else {
      setActiveTool(toolId);
    }
  };

  // Logik für die Dialog-Antwort
  const handleDialogueSelection = (dialogueItem) => {
    setMixerSpeech(dialogueItem.answer);
    engine.processInteraction(5, dialogueItem.points); // Punkte direkt vergeben
    
    // Nach 4 Sekunden verschwindet die Sprechblase automatisch
    setTimeout(() => {
      setMixerSpeech(null);
    }, 4000);
  };

  const handleAction = () => {
    if (!activeTool) {
      showDialog("Hinweis", "Bitte wähle zuerst unten ein Tool aus!");
      return;
    }
    const success = engine.processInteraction(activeTool);
    if (!success) showDialog("GPS", "Standort wird noch ermittelt...");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Theme.colors.background }]}>
      <TopBar 
        count={engine.count} 
        onOpenSettings={() => setSettingsVisible(true)} 
        onOpenInfo={() => setInfoVisible(true)} 
      />
      
      <InteractiveArea 
        rewardEvent={engine.rewardEvent} 
        onApplyTool={handleAction} 
        activeTool={activeTool} 
        currentSpeech={mixerSpeech} // NEU
      />
      
      <BottomToolbar activeTool={activeTool} onSelectTool={handleSelectTool} />
      
      <SettingsModal 
        visible={isSettingsVisible} 
        currentUserData={engine.userData} 
        onClose={() => setSettingsVisible(false)} 
        onSave={engine.setUserData} 
        showDialog={showDialog} 
        onReset={() => { engine.resetGame(); setSettingsVisible(false); showDialog("Reset", "Alles auf Null!"); }} 
      />
      
      <DiscoveryModal visible={isInfoVisible} onClose={() => setInfoVisible(false)} logbookData={engine.logbook} />
      
      <QuestionModal 
        visible={isQuestionVisible} 
        onClose={() => setQuestionVisible(false)} 
        onSelectQuestion={handleDialogueSelection} 
      />

      <InfoDialog 
        visible={dialogConfig.visible} 
        title={dialogConfig.title} 
        message={dialogConfig.message} 
        onClose={() => setDialogConfig({ ...dialogConfig, visible: false })} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });