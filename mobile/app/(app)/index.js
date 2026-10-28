import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getTasks } from '../../services/taskService';
import { getExpoPushToken } from '../../utils/notifications';
import { simpanPushToken, kirimNotifikasiUji } from '../../services/notificationService';

const C = { bg: '#0B0F14', panel: '#151C25', border: '#27313D', text: '#F4F7FA', muted: '#93A0AF', lime: '#C7F36B', orange: '#F7B955' };

export default function HomeScreen() {
  const { token, user, signOut } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    try { setTasks(await getTasks(token)); }
    catch (error) { Alert.alert('Gagal memuat tugas', error.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useFocusEffect(useCallback(() => { loadTasks(); }, [loadTasks]));

  const done = tasks.filter((item) => item.status === 'done').length;
  const open = tasks.length - done;

  async function activateNotifications() {
    try {
      const expoPushToken = await getExpoPushToken();
      await simpanPushToken(token, expoPushToken);
      Alert.alert('Notifikasi aktif', 'Token perangkat berhasil disimpan ke backend.');
    } catch (error) { Alert.alert('Notifikasi belum aktif', error.message); }
  }

  async function testNotifications() {
    try {
      const result = await kirimNotifikasiUji(token);
      Alert.alert('Server', result.pesan);
    } catch (error) { Alert.alert('Pengiriman gagal', error.message); }
  }

  async function logout() {
    Alert.alert('Keluar dari akun?', 'Sesi lokal akan dihapus dari perangkat.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut().catch((error) => Alert.alert('Gagal logout', error.message)) },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTasks(); }} tintColor={C.lime} />}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}><View style={styles.logo}><Text style={styles.logoText}>T</Text></View><Text style={styles.brand}>taskflow<Text style={styles.dot}>.</Text></Text></View>
        <Pressable onPress={() => router.push('/profile')} style={styles.avatar}><Text style={styles.avatarText}>{(user?.nama || 'U').slice(0, 1).toUpperCase()}</Text></Pressable>
      </View>
      <Text style={styles.eyebrow}>PERSONAL WORKSPACE</Text>
      <Text style={styles.title}>Selamat datang,{'\n'}<Text style={{ color: C.lime }}>{user?.nama?.split(' ')[0] || 'Teman'}.</Text></Text>
      <Text style={styles.subtitle}>Satu langkah kecil. Satu hal selesai.</Text>

      <View style={styles.hero}>
        <View style={styles.heroTop}><Text style={styles.heroLabel}>RINGKASAN TUGAS</Text><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View></View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statNum}>{loading ? '–' : String(open).padStart(2, '0')}</Text><Text style={styles.statLabel}>Belum selesai</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statNum}>{loading ? '–' : String(done).padStart(2, '0')}</Text><Text style={styles.statLabel}>Selesai</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statNum}>{loading ? '–' : String(tasks.length).padStart(2, '0')}</Text><Text style={styles.statLabel}>Total</Text></View>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }]} /></View>
        <Text style={styles.progressCaption}>{tasks.length ? `${Math.round((done / tasks.length) * 100)}% tugas selesai` : 'Belum ada tugas. Mulai dari satu hal kecil.'}</Text>
      </View>

      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Ruang kerja</Text><Text style={styles.sectionTag}>YOUR FLOW</Text></View>
      <Pressable style={styles.actionCard} onPress={() => router.push('/tasks')}>
        <View style={[styles.actionIcon, { backgroundColor: '#28311F' }]}><Text style={styles.actionSymbol}>✓</Text></View>
        <View style={styles.actionCopy}><Text style={styles.actionTitle}>Kelola tugas</Text><Text style={styles.actionDescription}>Buat tugas dan perbarui progresmu.</Text></View>
        <Text style={styles.arrow}>↗</Text>
      </Pressable>
      <Pressable style={styles.actionCard} onPress={() => router.push('/profile')}>
        <View style={[styles.actionIcon, { backgroundColor: '#202D3A' }]}><Text style={styles.actionSymbol}>◎</Text></View>
        <View style={styles.actionCopy}><Text style={styles.actionTitle}>Profil & sesi</Text><Text style={styles.actionDescription}>Cek identitas hasil endpoint privat.</Text></View>
        <Text style={styles.arrow}>↗</Text>
      </Pressable>

      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Push notification</Text><Text style={styles.sectionTag}>EXPO SERVICE</Text></View>
      <View style={styles.notificationCard}>
        <Text style={styles.notificationTitle}>Tetap terhubung.</Text>
        <Text style={styles.notificationDesc}>Daftarkan perangkat untuk menerima pembaruan ketika tugas dibuat atau selesai.</Text>
        <Pressable style={styles.primaryButton} onPress={activateNotifications}><Text style={styles.primaryButtonText}>Aktifkan notifikasi ↗</Text></Pressable>
        <Pressable style={styles.secondaryButton} onPress={testNotifications}><Text style={styles.secondaryButtonText}>Kirim notifikasi uji</Text></Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}><Text style={styles.logoutText}>Keluar dari akun</Text></Pressable>
      <Text style={styles.bottom}>TASKFLOW MOBILE  •  JWT + SECURESTORE</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg }, content: { padding: 22, paddingTop: 24, paddingBottom: 36 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, logo: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' }, logoText: { color: C.bg, fontWeight: '900', fontSize: 18 }, brand: { color: C.text, fontSize: 21, fontWeight: '900', letterSpacing: -0.7 }, dot: { color: C.lime }, avatar: { height: 38, width: 38, borderRadius: 15, backgroundColor: '#242D38', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: C.lime, fontWeight: '800', fontSize: 15 },
  eyebrow: { color: C.lime, fontSize: 9, letterSpacing: 2.1, fontWeight: '800', marginBottom: 11 }, title: { color: C.text, fontSize: 34, lineHeight: 39, fontWeight: '800', letterSpacing: -1 }, subtitle: { color: C.muted, fontSize: 13, marginTop: 10, marginBottom: 23 },
  hero: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 19, marginBottom: 27 }, heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heroLabel: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 }, livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#25311D', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 }, liveDot: { width: 5, height: 5, borderRadius: 5, backgroundColor: C.lime }, liveText: { color: C.lime, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 18 }, stat: { flex: 1 }, statNum: { color: C.text, fontSize: 27, fontWeight: '800', letterSpacing: -0.8 }, statLabel: { color: C.muted, fontSize: 10, marginTop: 4 }, statDivider: { width: 1, height: 35, backgroundColor: C.border, marginHorizontal: 10 }, progressTrack: { height: 5, backgroundColor: '#293340', borderRadius: 5, overflow: 'hidden' }, progressFill: { height: 5, backgroundColor: C.lime, borderRadius: 5 }, progressCaption: { color: C.muted, fontSize: 10, marginTop: 9 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }, sectionTitle: { color: C.text, fontWeight: '800', fontSize: 17 }, sectionTag: { color: '#687586', fontSize: 8, letterSpacing: 1.4, fontWeight: '800' }, actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 13, marginBottom: 10 }, actionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, actionSymbol: { color: C.lime, fontSize: 22, fontWeight: '800' }, actionCopy: { flex: 1 }, actionTitle: { color: C.text, fontSize: 13, fontWeight: '800' }, actionDescription: { color: C.muted, fontSize: 10, marginTop: 4 }, arrow: { color: C.lime, fontSize: 20, marginHorizontal: 5 },
  notificationCard: { backgroundColor: '#141C23', borderWidth: 1, borderColor: '#344034', borderRadius: 18, padding: 17, marginBottom: 23 }, notificationTitle: { color: C.text, fontSize: 16, fontWeight: '800' }, notificationDesc: { color: C.muted, lineHeight: 18, fontSize: 11, marginTop: 7, marginBottom: 14 }, primaryButton: { backgroundColor: C.lime, borderRadius: 11, padding: 13, alignItems: 'center' }, primaryButtonText: { color: C.bg, fontSize: 12, fontWeight: '900' }, secondaryButton: { padding: 13, alignItems: 'center', marginTop: 3 }, secondaryButtonText: { color: C.muted, fontSize: 11, fontWeight: '700' }, logoutButton: { borderWidth: 1, borderColor: C.border, borderRadius: 12, alignItems: 'center', padding: 14 }, logoutText: { color: '#D3A1A1', fontSize: 12, fontWeight: '700' }, bottom: { textAlign: 'center', color: '#52606F', fontSize: 8, letterSpacing: 1.5, marginTop: 23, fontWeight: '700' },
});
