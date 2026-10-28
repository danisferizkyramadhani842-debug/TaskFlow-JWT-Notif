import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { registerUser } from '../services/authService';

const C = { bg: '#0B0F14', panel: '#151C25', border: '#27313D', text: '#F4F7FA', muted: '#93A0AF', lime: '#C7F36B' };

export default function RegisterScreen() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!nama.trim() || !email.trim() || !password) return Alert.alert('Form belum lengkap', 'Isi nama, email, dan password.');
    try {
      setBusy(true);
      await registerUser(nama.trim(), email.trim(), password);
      Alert.alert('Akun dibuat', 'Registrasi berhasil. Silakan masuk.', [{ text: 'Lanjut', onPress: () => router.replace('/sign-in') }]);
    } catch (error) { Alert.alert('Registrasi gagal', error.message); }
    finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}><Text style={styles.logoMark}>T</Text></View>
        <Text style={styles.eyebrow}>MULAI DARI SINI</Text>
        <Text style={styles.title}>Buat ruang{ '\n' }untuk fokus.</Text>
        <Text style={styles.subtitle}>Satu akun untuk menyimpan tugas, progres, dan notifikasi kamu.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>NAMA LENGKAP</Text>
          <TextInput value={nama} onChangeText={setNama} placeholder="Nama kamu" placeholderTextColor="#677484" style={styles.input} maxLength={100} />
          <Text style={styles.label}>EMAIL</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="nama@email.com" placeholderTextColor="#677484" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={styles.input} maxLength={150} />
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Minimal 8 karakter" placeholderTextColor="#677484" secureTextEntry style={styles.input} />
          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#0B0F14" /> : <Text style={styles.buttonText}>Buat akun <Text style={{ fontSize: 18 }}>↗</Text></Text>}
          </Pressable>
        </View>
        <View style={styles.footerRow}><Text style={styles.footerText}>Sudah memiliki akun?</Text><Link href="/sign-in" style={styles.link}>Masuk</Link></View>
        <Text style={styles.bottom}>PASSWORD DI-HASH  •  SESSION VIA JWT</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 30 },
  logo: { width: 48, height: 48, borderRadius: 15, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  logoMark: { fontSize: 28, fontWeight: '900', color: C.bg },
  eyebrow: { fontSize: 10, letterSpacing: 2.5, fontWeight: '800', color: C.lime, marginBottom: 12 },
  title: { fontSize: 36, lineHeight: 40, fontWeight: '800', color: C.text, letterSpacing: -1.1 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 14, marginBottom: 24 },
  card: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 20 },
  label: { color: C.muted, fontSize: 10, letterSpacing: 1.4, fontWeight: '800', marginBottom: 9, marginTop: 7 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, color: C.text, fontSize: 14, marginBottom: 10, backgroundColor: '#10161E' },
  button: { backgroundColor: C.lime, borderRadius: 13, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: C.bg, fontSize: 14, fontWeight: '800' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 23 },
  footerText: { color: C.muted, fontSize: 13 },
  link: { color: C.lime, fontSize: 13, fontWeight: '800' },
  bottom: { textAlign: 'center', marginTop: 30, color: '#52606F', fontSize: 9, letterSpacing: 1.3, fontWeight: '700' },
});
