import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return false;

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

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🦄 ${title}`,
          // Untertitel für iOS (eigene Zeile)
          subtitle: "Aktion erforderlich!", 
          // Haupttext mit zwei Umbrüchen für bessere Sichtbarkeit auf Android
          body: `${body}\n\n🚀 TIPP: App manuell öffnen!`,
          sound: 'default',
          priority: 'high',
          channelId: 'mixer-urgent',
        },
        trigger: { 
          type: 'timeInterval',
          seconds: Math.max(Math.round(seconds), 1),
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