import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../app/src/api/services/auth-service';
import { useAuth } from '../app/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PolicyModal from '@/components/PolicyModal';
import { fcmService } from '@/app/src/api/services/panic-service';
import messaging from '@react-native-firebase/messaging';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const colors = {
    background: isDark ? "#121212" : "#ffffff",
    text: isDark ? "#ffffff" : "#000000",
    placeholder: isDark ? "#bbbbbb" : "#999999",
    inputBackground: isDark ? "#1e1e1e" : "#f5f9ff",
    inputBorder: isDark ? "#333" : "#e1f5fe",
    buttonBackground: isDark ? "#333" : "#01579b",
    buttonText: "#ffffff",
    secondaryText: isDark ? "#cccccc" : "#546e7a",
    accent: isDark ? "#80d8ff" : "#01579b",
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.data?.token) {
        await AsyncStorage.setItem('auth-token', response.data.token);

        if (response.data.user) {
          await AsyncStorage.setItem('user-data', JSON.stringify(response.data.user));
        }

        const fcmToken = await messaging().getToken();
        await fcmService.saveToken(fcmToken);
        await login();
        router.replace('/');
      } else {
        Alert.alert('Error', 'No se recibió un token válido. Intenta de nuevo.');
      }
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      Alert.alert('Error al iniciar sesión: ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardContainer}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.title, { color: colors.accent }]}>Viryx SOS</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Seguridad a un toque de distancia</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
              <Ionicons name="mail-outline" size={22} color={colors.accent} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Correo electrónico"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.accent} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Contraseña"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} disabled={loading} style={styles.eyeButton}>
                <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={22} color={colors.accent} />
              </TouchableOpacity>
            </View>

            <View style={styles.linksRow}>
              <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} disabled={loading}>
                <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPolicyModal(true)} disabled={loading} style={{ marginLeft: 15 }}>
                <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>Ver políticas</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.buttonBackground }, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={20} color={colors.buttonText} style={styles.spinIcon} />
                  <Text style={[styles.loginButtonText, { color: colors.buttonText }]}>Cargando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="log-in-outline" size={20} color={colors.buttonText} />
                  <Text style={[styles.loginButtonText, { color: colors.buttonText }]}>Iniciar Sesión</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerContainer} onPress={() => router.push('/auth/register')} disabled={loading}>
              <Text style={[styles.registerText, { color: colors.secondaryText }]}>
                ¿No tienes cuenta? <Text style={{ color: colors.accent, fontWeight: 'bold' }}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.creditsText, { color: colors.secondaryText }]}>Powered by SoftKilla.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <PolicyModal visible={showPolicyModal} onAccept={() => setShowPolicyModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 15
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center'
  },
  formContainer: {
    width: "100%",
    marginBottom: 20
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderRadius: 12,
    borderWidth: 1,
    height: 56
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16
  },
  eyeButton: {
    padding: 10,
    paddingRight: 15
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500"
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: {
    opacity: 0.6
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinIcon: {
    marginRight: 8
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center"
  },
  registerText: {
    fontSize: 15
  },
  creditsText: {
    fontSize: 12,
    marginTop: 20,
    textAlign: "center"
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4
  },
});
