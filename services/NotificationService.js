import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Konfiguration, wie die App mit Benachrichtigungen umgeht, wenn sie im Vordergrund ist
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  /**
   * Fordert die Berechtigung für Benachrichtigungen an.
   */
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  /**
   * Plant eine lokale Benachrichtigung nach einer Verzögerung.
   * @param {number} seconds - Verzögerung in Sekunden.
   */
  async scheduleReminder(seconds) {
    // Zuerst alle alten geplanten Erinnerungen löschen, um Spam zu vermeiden
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Mixer vermisst dich! 🦄",
        body: "Hey, kümmere dich um Mixer!",
        sound: true,
      },
      trigger: { seconds: seconds },
    });
  },

  /**
   * Stoppt alle geplanten Benachrichtigungen (z.B. wenn User die App wieder öffnet).
   */
  async cancelReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};