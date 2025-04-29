// app/screens/ChangePasswordScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import AppHeader from "@/components/AppHeader";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const validatePassword = (password: string) => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una letra mayúscula.";
    if (!/[a-z]/.test(password)) return "Debe contener al menos una letra minúscula.";
    if (!/[0-9]/.test(password)) return "Debe contener al menos un número.";
    if (!/[\W_]/.test(password)) return "Debe contener al menos un símbolo especial.";
    return "";
  };

  const handleChangePassword = () => {
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError = newPassword !== confirmPassword ? "Las contraseñas no coinciden." : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    if (newPasswordError || confirmPasswordError) {
      setErrors({
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    // Simular éxito
    Alert.alert("Éxito", "Tu contraseña ha sido actualizada.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Cambiar contraseña" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>


          <Text style={styles.label}>Contraseña actual</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Ingresa tu contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={[styles.input, errors.newPassword ? styles.inputError : null]}
            secureTextEntry
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setErrors((prev) => ({ ...prev, newPassword: "" }));
            }}
          />
          {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}

          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
            secureTextEntry
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
          />
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Actualizar contraseña</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "red",
    marginTop: 4,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#01579b",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
