import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true, // Badge am App-Icon zeigen
  }),
});

export const NotificationService = {
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    // KANAL-OPTIMIERUNG FÜR MAXIMALE AUFMERKSAMKEIT
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mixer-urgent', {
        name: 'Mixer Wichtige Meldungen',
        importance: Notifications.AndroidImportance.MAX, // ERZWINGT HEADS-UP
        vibrationPattern: [0, 250, 250, 250, 500, 250], // Markantes Muster
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Optional: Darf "Bitte nicht stören" umgehen
      });
    }

    return true;
  },

  async scheduleReminder(seconds, title, body) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🦄 ${title}`, // Emoji im Titel fällt mehr auf
          subtitle: "Mixer braucht Hilfe!", // Nur iOS
          body: body,
          sound: 'default',
          priority: 'high', // Für Android < 8.0
          color: '#FF69B4', // Farbe des Icons in der Statusleiste (Android)
          badge: 1,
          channelId: 'mixer-urgent', // Verweist auf den MAX-Importance Kanal
          data: { screen: 'Game' }, // Daten für Deep-Linking
        },
        trigger: { 
          type: 'timeInterval',
          seconds: Math.round(seconds),
          repeats: false 
        },
      });
    } catch (error) {
      console.error("Notification Error:", error);
    }
  }
};