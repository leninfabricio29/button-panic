// app/screens/RegisterScreen.tsx

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '../app/src/api/services/auth-service';

export default function RegisterScreen() {
  const router = useRouter();
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
          [
            { text: 'Aceptar', onPress: () => router.replace('/auth/login') } // ✅ Redirigimos al login
          ]
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
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add-outline" size={40} color="#ffffff" />
            </View>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Completa los siguientes datos para registrarte</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={22} color="#01579b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Cédula"
                    value={ci}
                    onChangeText={setCi}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
              </View>
              
              <View style={styles.gridItem}>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={22} color="#01579b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Teléfono"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.fullWidthContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#01579b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombres completos"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>
            </View>
            
            <View style={styles.fullWidthContainer}>
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
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.disabledButton]} 
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
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? <Text style={styles.loginTextBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.creditsText}>Powered by SoftKilla. </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#01579b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: {
    fontSize: 26,
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
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  gridItem: {
    width: '48%'
  },
  fullWidthContainer: {
    width: '100%',
    marginBottom: 6
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  registerButton: {
    backgroundColor: "#01579b",
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
    marginRight: 8
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8
  },
  loginContainer: {
    marginTop: 20,
    alignItems: "center"
  },
  loginText: {
    color: "#546e7a",
    fontSize: 15
  },
  loginTextBold: {
    color: "#01579b",
    fontWeight: "bold"
  },
  creditsText: {
    color: "#90a4ae",
    fontSize: 12,
    marginTop: 20,
    textAlign: "center"
  }
});