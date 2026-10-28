import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';

export default function AppLayout() {
  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notifikasi diterima:', notification.request.content);
    });
    const response = Notifications.addNotificationResponseReceivedListener((event) => {
      const screen = event.notification.request.content.data?.screen;
      if (screen === 'tasks') router.push('/tasks');
      if (screen === 'profile') router.push('/profile');
    });
    return () => { received.remove(); response.remove(); };
  }, []);

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F14' } }} />;
}
