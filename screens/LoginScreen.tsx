import { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../app/src/api/services/auth-service';
import { useAuth } from '../app/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PolicyModal from '@/components/PolicyModal';
import { fcmService } from '@/app/src/api/services/panic-service';
import messaging from '@react-native-firebase/messaging';
import ImageModal from '../components/ImageModal';

const LOCAL_IMAGES = [
  require('../assets/images/logo.jpg'),
  require('../assets/images/splash-icon.png'),
];

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { login } = useAuth();

  const checkShowImage = () => {
    const randomNumber = Math.floor(Math.random() * 5) + 1; // Número aleatorio entre 1 y 5
    
    if (randomNumber % 2 === 0) { // Si es par
      const randomImageIndex = Math.floor(Math.random() * LOCAL_IMAGES.length);
      setSelectedImage(LOCAL_IMAGES[randomImageIndex]);
      setShowImage(true);
    }
  };

  useEffect(() => {
    checkShowImage();
    console.log('showImage:', selectedImage);
  }, []);

  const handleCloseImage = () => {
    setShowImage(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      console.log('Login response:', response);
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && response.data.token) {
        // Guardar token y datos de usuario
        await AsyncStorage.setItem('auth-token', response.data.token);

        // Asegurarse de que user existe antes de guardarlo
        if (response.data.user) {
          await AsyncStorage.setItem('user-data', JSON.stringify(response.data.user));
          console.log("Datos de usuario guardados:", response.data.user);
        } else {
          console.warn("No se recibieron datos de usuario");
        }

      const fcmToken = await messaging().getToken();
    console.log("🔐 Token FCM obtenido:", fcmToken);


    await fcmService.saveToken(fcmToken); // ← Aquí se guarda en el backend


        await login();

        router.replace('/');
      } else {
        console.warn("Respuesta inesperada:", response);
        Alert.alert('Error', 'No se recibió un token válido. Intenta de nuevo.');
      }
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';

      if (error.response && error.response.data) {
        // Si hay un mensaje de error en la respuesta, úsalo
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }

      // Mostrar mensaje específico si es posible
      Alert.alert('Error al iniciar sesión: ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            {/* <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            /> */}
            <Text style={styles.title}>SafeGuard</Text>
            <Text style={styles.subtitle}>Seguridad a un toque de distancia</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#01579b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#01579b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                placeholderTextColor="#999"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                disabled={loading}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#01579b"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.linksRow}>
              <TouchableOpacity
                onPress={() => router.push('/auth/forgot-password')}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowPolicyModal(true)}
                disabled={loading}
                style={{ marginLeft: 15 }}
              >
                <Text style={styles.forgotPasswordText}>Ver políticas</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={20} color="#ffffff" style={styles.spinIcon} />
                  <Text style={styles.loginButtonText}>Cargando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerContainer}
              onPress={() => router.push('/auth/register')}
              disabled={loading}
            >
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.registerTextBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.creditsText}>Powered by SoftKilla.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <PolicyModal
        visible={showPolicyModal}
        onAccept={() => setShowPolicyModal(false)}
      />
      <ImageModal
        visible={showImage}
        onClose={handleCloseImage}
        imageSource={selectedImage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  keyboardContainer: {
    flex: 1
  },
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
    color: "#01579b",
    marginBottom: 8
  },
  subtitle: {
    color: "#546e7a",
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
    backgroundColor: "#f5f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1f5fe",
    height: 56
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10
  },
  input: {
    flex: 1,
    height: 56,
    color: "#37474f",
    fontSize: 16
  },
  eyeButton: {
    padding: 10,
    paddingRight: 15
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 4
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#0277bd",
    fontWeight: "500"
  },
  loginButton: {
    backgroundColor: "#01579b",
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
    backgroundColor: "#90a4ae",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinIcon: {
    marginRight: 8,
    transform: [{ rotate: '0deg' }],
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center"
  },
  registerText: {
    color: "#546e7a",
    fontSize: 15
  },
  registerTextBold: {
    color: "#01579b",
    fontWeight: "bold"
  },
  creditsText: {
    color: "#90a4ae",
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