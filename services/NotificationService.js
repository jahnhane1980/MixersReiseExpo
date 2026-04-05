import * as Notifications from 'expo-notifications';
// FIX: Alert muss aus react-native importiert werden
import { Platform, Alert } from 'react-native';

// Greift NUR, wenn die App offen ist.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  /**
   * Fordert Berechtigungen an und konfiguriert den Android-Kanal.
   */
  async requestPermissions() {
    // FIX: Explizite iOS-Rechte anfordern
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    
    if (status !== 'granted') {
      console.log("Benachrichtigungen wurden nicht erlaubt.");
      // WICHTIG FÜR TESTS: Wenn man auf iOS einmal ablehnt, fragt der Dialog nie wieder.
      // Man muss die Rechte dann manuell in den iPhone-Einstellungen aktivieren.
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mixer-urgent', {
        name: 'Mixer Wichtige Meldungen',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    return true;
  },

  /**
   * Plant eine Benachrichtigung mit erzwungenem Zeilenumbruch.
   */
  async scheduleReminder(seconds, title, body) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // FIX: Minimaler Puffer von 3 Sekunden, damit iOS den Trigger auch bei 
      // schnellem Schließen der App verlässlich registrieren kann.
      const safeSeconds = Math.max(Math.round(seconds), 3);
const triggerDate = new Date(Date.now() + safeSeconds * 1000);
      
      // FIX: Robuste manuelle Formatierung, um Bugs der React Native JS-Engine zu umgehen
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🦄 ${title}`,
          subtitle: "Aktion erforderlich!", 
          body: `${body}\n\n🚀 TIPP: App manuell öffnen!`,
          sound: 'default',
          // priority & channelId sind Android-only. iOS stört sich aber nicht daran.
          priority: 'high',
          channelId: 'mixer-urgent',
        },
        trigger: { 
          type: 'timeInterval',
          seconds: safeSeconds,
          repeats: false 
        },
      });
    } catch (error) {    
      console.error("NotificationService Error:", error);
    }
  },

  async cancelReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};