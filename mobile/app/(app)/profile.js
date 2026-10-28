import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/authService';

const C = { bg: '#0B0F14', panel: '#151C25', border: '#27313D', text: '#F4F7FA', muted: '#93A0AF', lime: '#C7F36B' };

export default function ProfileScreen() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getMe(token).then((result) => { if (active) setProfile(result); })
      .catch((error) => Alert.alert('Gagal mengambil profil', error.message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.top}><Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.topLabel}>ACCOUNT / VERIFIED SESSION</Text><View style={{ width: 36 }} /></View>
      <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.nama || 'U').slice(0, 1).toUpperCase()}</Text></View>
      <Text style={styles.eyebrow}>YOUR IDENTITY</Text><Text style={styles.title}>Profil{ '\n' }pengguna.</Text>
      <Text style={styles.subtitle}>Data di bawah dimuat melalui GET /auth/me dengan Bearer JWT.</Text>
      <View style={styles.card}>
        {loading ? <ActivityIndicator color={C.lime} /> : <>
          <Text style={styles.label}>NAMA</Text><Text style={styles.value}>{profile?.nama || user?.nama || '-'}</Text>
          <View style={styles.divider} /><Text style={styles.label}>EMAIL</Text><Text style={styles.value}>{profile?.email || user?.email || '-'}</Text>
          <View style={styles.divider} /><Text style={styles.label}>USER ID</Text><Text style={styles.value}>#{profile?.id ?? user?.id ?? '-'}</Text>
          <View style={styles.divider} /><Text style={styles.label}>SESSION</Text><Text style={styles.session}>● JWT VALIDATED BY API</Text>
        </>}
      </View>
      <Pressable style={styles.button} onPress={() => router.replace('/(app)')}><Text style={styles.buttonText}>Kembali ke beranda ↗</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: C.bg }, content: { padding: 23, paddingTop: 20, flexGrow: 1 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 39 }, back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border }, backText: { color: C.text, fontSize: 28, lineHeight: 30 }, topLabel: { color: C.muted, fontSize: 8, letterSpacing: 1.4, fontWeight: '800' }, avatar: { width: 65, height: 65, borderRadius: 22, backgroundColor: '#26331F', borderWidth: 1, borderColor: '#46583A', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, avatarText: { color: C.lime, fontSize: 27, fontWeight: '900' }, eyebrow: { color: C.lime, fontSize: 9, letterSpacing: 2, fontWeight: '800', marginBottom: 10 }, title: { color: C.text, fontSize: 35, lineHeight: 39, fontWeight: '800', letterSpacing: -1 }, subtitle: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 10, marginBottom: 24 }, card: { backgroundColor: C.panel, borderColor: C.border, borderWidth: 1, borderRadius: 18, padding: 18 }, label: { color: C.muted, fontSize: 9, letterSpacing: 1.4, fontWeight: '800', marginBottom: 8 }, value: { color: C.text, fontSize: 14, fontWeight: '700' }, divider: { height: 1, backgroundColor: C.border, marginVertical: 17 }, session: { color: C.lime, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }, button: { backgroundColor: C.lime, borderRadius: 13, padding: 15, alignItems: 'center', marginTop: 18 }, buttonText: { color: C.bg, fontSize: 12, fontWeight: '900' } });
