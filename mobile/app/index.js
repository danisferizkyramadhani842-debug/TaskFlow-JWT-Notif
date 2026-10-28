import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function IndexScreen() {
  const { token, loading } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#0B0F14', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#C7F36B" /></View>;
  }
  return <Redirect href={token ? '/(app)' : '/sign-in'} />;
}
