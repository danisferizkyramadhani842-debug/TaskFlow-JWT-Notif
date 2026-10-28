import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

function Navigator() {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F14', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#C7F36B" size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F14' } }}>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="register" />
        </Stack.Protected>
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return <AuthProvider><Navigator /></AuthProvider>;
}
