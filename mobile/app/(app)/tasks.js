import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { createTask, getTasks, updateTaskStatus } from '../../services/taskService';

const C = { bg: '#0B0F14', panel: '#151C25', border: '#27313D', text: '#F4F7FA', muted: '#93A0AF', lime: '#C7F36B', blue: '#88C7FF' };
const nextStatus = { pending: 'in_progress', in_progress: 'done', done: 'pending' };
const statusLabel = { pending: 'BELUM MULAI', in_progress: 'DIKERJAKAN', done: 'SELESAI' };

export default function TasksScreen() {
  const { token } = useAuth();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setTasks(await getTasks(token)); }
    catch (error) { Alert.alert('Gagal memuat tugas', error.message); }
    finally { setLoading(false); }
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function addTask() {
    if (!judul.trim()) return Alert.alert('Judul wajib diisi', 'Tulis nama tugas sebelum menyimpan.');
    try {
      setBusy(true);
      const result = await createTask(token, judul.trim(), deskripsi.trim());
      setJudul(''); setDeskripsi('');
      await load();
      Alert.alert('Tugas dibuat', result.notifikasi?.status === 'terkirim_ke_service' ? 'Tugas tersimpan dan notifikasi diteruskan ke Expo Push Service.' : 'Tugas tersimpan. Push akan diterima setelah perangkat mendaftarkan token yang valid.');
    } catch (error) { Alert.alert('Gagal membuat tugas', error.message); }
    finally { setBusy(false); }
  }

  async function changeStatus(task) {
    try { await updateTaskStatus(token, task.id, nextStatus[task.status] || 'pending'); await load(); }
    catch (error) { Alert.alert('Gagal memperbarui status', error.message); }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.lime} />}>
      <View style={styles.top}><Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.topLabel}>TASKFLOW / WORKSPACE</Text><View style={{ width: 36 }} /></View>
      <Text style={styles.eyebrow}>YOUR LIST</Text>
      <Text style={styles.title}>Tugas yang{ '\n' }punya arah.</Text>
      <Text style={styles.subtitle}>Simpan satu pekerjaan, lalu gerakkan statusnya seiring progres.</Text>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Tugas baru <Text style={{ color: C.lime }}>+</Text></Text>
        <TextInput value={judul} onChangeText={setJudul} placeholder="Contoh: Selesaikan laporan praktikum" placeholderTextColor="#677484" style={styles.input} maxLength={150} />
        <TextInput value={deskripsi} onChangeText={setDeskripsi} placeholder="Catatan tambahan (opsional)" placeholderTextColor="#677484" style={[styles.input, styles.textArea]} multiline maxLength={3000} />
        <Pressable style={styles.primaryButton} onPress={addTask} disabled={busy}>{busy ? <ActivityIndicator color={C.bg} /> : <Text style={styles.primaryButtonText}>Simpan tugas ↗</Text>}</Pressable>
      </View>

      <View style={styles.listHead}><Text style={styles.listTitle}>Daftar tugas</Text><View style={styles.countPill}><Text style={styles.countText}>{tasks.length} ITEM</Text></View></View>
      {loading && tasks.length === 0 ? <ActivityIndicator color={C.lime} style={{ marginTop: 24 }} /> : tasks.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptySymbol}>✳</Text><Text style={styles.emptyTitle}>Masih kosong.</Text><Text style={styles.emptyText}>Tugas pertama tidak akan menambahkan dirinya sendiri. Tragis, tapi bisa diatasi.</Text></View>
      ) : tasks.map((task) => (
        <Pressable key={task.id} style={styles.taskCard} onPress={() => changeStatus(task)}>
          <View style={styles.taskTop}><View style={[styles.statusDot, { backgroundColor: task.status === 'done' ? C.lime : task.status === 'in_progress' ? C.blue : '#667382' }]} /><Text style={[styles.statusLabel, { color: task.status === 'done' ? C.lime : task.status === 'in_progress' ? C.blue : C.muted }]}>{statusLabel[task.status] || task.status}</Text><Text style={styles.changeHint}>ubah status ↗</Text></View>
          <Text style={[styles.taskTitle, task.status === 'done' && styles.doneTitle]}>{task.judul}</Text>
          {!!task.deskripsi && <Text style={styles.taskDescription}>{task.deskripsi}</Text>}
          <Text style={styles.taskDate}>TASK #{task.id}</Text>
        </Pressable>
      ))}
      <Text style={styles.helper}>Ketuk kartu untuk berpindah status: Belum mulai → Dikerjakan → Selesai. Saat ditandai selesai, backend mencoba mengirim push notification.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg }, content: { padding: 22, paddingTop: 20, paddingBottom: 42 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }, back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border }, backText: { color: C.text, fontSize: 28, lineHeight: 30 }, topLabel: { color: C.muted, fontSize: 9, letterSpacing: 1.7, fontWeight: '800' }, eyebrow: { color: C.lime, fontSize: 9, letterSpacing: 2, fontWeight: '800', marginBottom: 10 }, title: { color: C.text, fontSize: 34, lineHeight: 38, fontWeight: '800', letterSpacing: -1 }, subtitle: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 10, marginBottom: 24 }, form: { backgroundColor: C.panel, borderColor: C.border, borderWidth: 1, borderRadius: 19, padding: 16, marginBottom: 28 }, formTitle: { color: C.text, fontWeight: '800', fontSize: 15, marginBottom: 13 }, input: { minHeight: 48, backgroundColor: '#10161E', color: C.text, borderColor: C.border, borderWidth: 1, borderRadius: 11, paddingHorizontal: 13, fontSize: 12, marginBottom: 10 }, textArea: { height: 75, paddingTop: 13, textAlignVertical: 'top' }, primaryButton: { minHeight: 48, backgroundColor: C.lime, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 2 }, primaryButtonText: { color: C.bg, fontSize: 12, fontWeight: '900' }, listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }, listTitle: { color: C.text, fontWeight: '800', fontSize: 17 }, countPill: { backgroundColor: '#202A35', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }, countText: { color: C.muted, fontSize: 8, letterSpacing: 1, fontWeight: '900' }, empty: { borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', borderRadius: 16, padding: 22, alignItems: 'center' }, emptySymbol: { color: C.lime, fontSize: 28, marginBottom: 10 }, emptyTitle: { color: C.text, fontSize: 15, fontWeight: '800' }, emptyText: { color: C.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 8 }, taskCard: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 15, marginBottom: 10 }, taskTop: { flexDirection: 'row', alignItems: 'center', gap: 7 }, statusDot: { width: 6, height: 6, borderRadius: 6 }, statusLabel: { fontSize: 8, letterSpacing: 1, fontWeight: '900' }, changeHint: { color: '#607080', fontSize: 9, marginLeft: 'auto' }, taskTitle: { color: C.text, fontSize: 14, lineHeight: 20, fontWeight: '800', marginTop: 12 }, doneTitle: { textDecorationLine: 'line-through', color: '#82908D' }, taskDescription: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 6 }, taskDate: { color: '#596777', fontSize: 8, letterSpacing: 1.2, fontWeight: '800', marginTop: 13 }, helper: { color: '#677484', fontSize: 10, lineHeight: 16, marginTop: 8 },
});
