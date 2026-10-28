import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const C = { bg: '#0B0F14', panel: '#151C25', border: '#27313D', text: '#F4F7FA', muted: '#93A0AF', lime: '#C7F36B' };

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) return Alert.alert('Form belum lengkap', 'Isi email dan password.');
    try { setBusy(true); await signIn(email.trim(), password); }
    catch (error) { Alert.alert('Login gagal', error.message); }
    finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}><Text style={styles.logoMark}>T</Text></View>
        <Text style={styles.eyebrow}>TASKFLOW / PRODUCTIVITY</Text>
        <Text style={styles.title}>Kerja rapi.{ '\n' }Pikiran lega.</Text>
        <Text style={styles.subtitle}>Masuk untuk mengelola tugas dan menerima pembaruan penting.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="nama@email.com" placeholderTextColor="#677484" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={styles.input} />
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Minimal 8 karakter" placeholderTextColor="#677484" secureTextEntry style={styles.input} />
          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#0B0F14" /> : <Text style={styles.buttonText}>Masuk ke TaskFlow <Text style={{ fontSize: 18 }}>↗</Text></Text>}
          </Pressable>
        </View>
        <View style={styles.footerRow}><Text style={styles.footerText}>Belum punya akun?</Text><Link href="/register" style={styles.link}>Buat akun</Link></View>
        <Text style={styles.bottom}>JWT AUTHENTICATION  •  SECURE SESSION</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 36 },
  logo: { width: 48, height: 48, borderRadius: 15, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  logoMark: { fontSize: 28, fontWeight: '900', color: C.bg },
  eyebrow: { fontSize: 10, letterSpacing: 2.5, fontWeight: '800', color: C.lime, marginBottom: 12 },
  title: { fontSize: 39, lineHeight: 43, fontWeight: '800', color: C.text, letterSpacing: -1.3 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 14, marginBottom: 28, maxWidth: 330 },
  card: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 20 },
  label: { color: C.muted, fontSize: 10, letterSpacing: 1.4, fontWeight: '800', marginBottom: 9, marginTop: 7 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, minHeight: 50, paddingHorizontal: 14, color: C.text, fontSize: 14, marginBottom: 12, backgroundColor: '#10161E' },
  button: { backgroundColor: C.lime, borderRadius: 13, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: C.bg, fontSize: 14, fontWeight: '800' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 23 },
  footerText: { color: C.muted, fontSize: 13 },
  link: { color: C.lime, fontSize: 13, fontWeight: '800' },
  bottom: { textAlign: 'center', marginTop: 36, color: '#52606F', fontSize: 9, letterSpacing: 1.7, fontWeight: '700' },
});
