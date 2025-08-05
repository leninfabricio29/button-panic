import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '../app/src/api/services/auth-service';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [ci, setCi] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !ci || !email || !phone) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({ name, ci, email, phone });
      if (response.data.user) {
        Alert.alert(
          'Registro exitoso',
          'Un administrador validará tu cuenta y te proporcionará tus credenciales. 🚀',
          [{ text: 'Aceptar', onPress: () => router.replace('/auth/login') }]
        );
      } else {
        Alert.alert('Error', 'No se pudo completar el registro. Inténtalo más tarde.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al registrarte. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#37474f',
    inputBg: isDark ? '#1e1e1e' : '#f5f9ff',
    inputBorder: isDark ? '#333' : '#e1f5fe',
    placeholder: isDark ? '#aaa' : '#999',
    title: isDark ? '#ffffff' : '#01579b',
    subtitle: isDark ? '#ccc' : '#546e7a',
    mutedText: isDark ? '#888' : '#90a4ae',
    loginTextBold: isDark ? '#64b5f6' : '#01579b',
    buttonBg: loading ? '#90a4ae' : '#01579b',
    inputText: isDark ? '#ffffff' : '#37474f'
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.title }]}>
              <Ionicons name="person-add-outline" size={40} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: colors.title }]}>Crea tu cuenta</Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>Completa los siguientes datos para registrarte</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Ionicons name="card-outline" size={22} color={colors.title} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.inputText }]}
                    placeholder="Cédula"
                    value={ci}
                    onChangeText={setCi}
                    keyboardType="numeric"
                    placeholderTextColor={colors.placeholder}
                    editable={!loading}
                  />
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Ionicons name="call-outline" size={22} color={colors.title} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.inputText }]}
                    placeholder="Teléfono"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.placeholder}
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            <View style={styles.fullWidthContainer}>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Ionicons name="person-outline" size={22} color={colors.title} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="Nombres completos"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.placeholder}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.fullWidthContainer}>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Ionicons name="mail-outline" size={22} color={colors.title} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.placeholder}
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, { backgroundColor: colors.buttonBg }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={20} color="#ffffff" style={styles.spinIcon} />
                  <Text style={styles.registerButtonText}>Procesando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                  <Text style={styles.registerButtonText}>Registrar cuenta</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginContainer} 
              onPress={() => router.push('/auth/login')}
              disabled={loading}
            >
              <Text style={[styles.loginText, { color: colors.subtitle }]}>¿Ya tienes cuenta? <Text style={{ color: colors.loginTextBold, fontWeight: "bold" }}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.creditsText, { color: colors.mutedText }]}>Powered by SoftKilla.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 25, paddingTop: 20, paddingBottom: 20 },
  header: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  formContainer: { width: "100%", marginBottom: 20 },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  gridItem: { width: '48%' },
  fullWidthContainer: { width: '100%', marginBottom: 6 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15, borderRadius: 12, borderWidth: 1, height: 56 },
  inputIcon: { paddingLeft: 15, paddingRight: 10 },
  input: { flex: 1, height: 56, fontSize: 16 },
  registerButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  spinIcon: { marginRight: 8 },
  registerButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700", marginLeft: 8 },
  loginContainer: { marginTop: 20, alignItems: "center" },
  loginText: { fontSize: 15 },
  creditsText: { fontSize: 12, marginTop: 20, textAlign: "center" }
});
