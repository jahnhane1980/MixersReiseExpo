import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import TopBar from './components/TopBar';
import BottomToolbar from './components/BottomToolbar';
import InteractiveArea from './components/InteractiveArea';
import SettingsModal from './components/SettingsModal';
import DiscoveryModal from './components/DiscoveryModal';
import InfoDialog from './components/InfoDialog'; 

import { Theme } from './constants/Theme';
import { useGameEngine } from './hooks/useGameEngine'; // NEU

export default function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '' });

  const showDialog = (title, message) => setDialogConfig({ visible: true, title, message });

  // Die Engine nutzen
  const engine = useGameEngine(showDialog);

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
      />
      
      <BottomToolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      
      <SettingsModal 
        visible={isSettingsVisible} 
        currentUserData={engine.userData} 
        onClose={() => setSettingsVisible(false)} 
        onSave={engine.setUserData} 
        showDialog={showDialog} 
        onReset={() => { engine.resetGame(); setSettingsVisible(false); showDialog("Reset", "Alles auf Null!"); }} 
      />
      
      <DiscoveryModal visible={isInfoVisible} onClose={() => setInfoVisible(false)} logbookData={engine.logbook} />
      
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