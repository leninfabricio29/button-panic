import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import Layout from './app/_layout';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

// 🔁 Notificaciones en segundo plano
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (remoteMessage?.data?.type === 'emergencia') {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || '🚨 Emergencia',
      body: remoteMessage.notification?.body || '¡Revisa la aplicación!',
      android: {
        channelId: 'panic_channel_v2',
        importance: notifee.AndroidImportance.HIGH,
        category: notifee.AndroidCategory.CALL,
        fullScreenAction: { id: 'default' },
        pressAction: { id: 'default' },
      },
    });
  }
});

// Registra la app principal
AppRegistry.registerComponent(appName, () => Layout);
