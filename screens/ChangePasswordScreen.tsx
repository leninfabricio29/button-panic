import React, { useState, useEffect } from "react";
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
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { authService } from "../app/src/api/services/auth-service";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "expo-router";

type PasswordRequirement = {
  label: string;
  validator: (password: string) => boolean;
  id: string;
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#ffffff",
    text: isDark ? "#ffffff" : "#000000",
    inputBorder: isDark ? "#555" : "#ddd",
    error: "#ff5252",
    success: "#4caf50",
    button: isDark ? "#1e88e5" : "#01579b",
    buttonDisabled: "#cccccc",
    placeholder: isDark ? "#aaaaaa" : "#888888",
    requirementMet: "#4caf50",
    requirementUnmet: isDark ? "#aaaaaa" : "#888888",
  };

  const dynamicStyles = {
    imagePassword: {
      width: "90%",
      height: 150,
      resizeMode: "contain",
      marginBottom: 20,
      borderWidth: 2,
      borderColor: isDark ? "#444" : "#ccc",
      borderRadius: 12,
      backgroundColor: isDark ? "#1c1c1e" : "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [passwordRequirements, setPasswordRequirements] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();

  const requirements: PasswordRequirement[] = [
    { id: "length", label: "Al menos 8 caracteres", validator: (p) => p.length >= 8 },
    { id: "uppercase", label: "Al menos una mayúscula", validator: (p) => /[A-Z]/.test(p) },
    { id: "lowercase", label: "Al menos una minúscula", validator: (p) => /[a-z]/.test(p) },
    { id: "number", label: "Al menos un número", validator: (p) => /[0-9]/.test(p) },
    { id: "special", label: "Al menos un símbolo especial", validator: (p) => /[\W_]/.test(p) },
  ];

  useEffect(() => {
    const newReqs: { [key: string]: boolean } = {};
    requirements.forEach((req) => {
      newReqs[req.id] = req.validator(newPassword);
    });
    setPasswordRequirements(newReqs);
  }, [newPassword]);

  const validatePassword = (password: string) => {
    for (const req of requirements) {
      if (!req.validator(password)) {
        return `La contraseña no cumple con el requisito: ${req.label}`;
      }
    }
    return "";
  };

  const handleChangePassword = async () => {
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError =
      newPassword !== confirmPassword ? "Las contraseñas no coinciden." : "";

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

    if (!user?.email) {
      Alert.alert("Error", "No se pudo obtener el email del usuario. Por favor, inicia sesión nuevamente.");
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword({
        email: user.email,
        currentPassword,
        newPassword,
      });

      Alert.alert("Éxito", "Tu contraseña ha sido actualizada correctamente. Por favor inicia sesión nuevamente.", [
        {
          text: "OK",
          onPress: async () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
            await logout();
            router.push("/auth/login");
          },
        },
      ]);
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      let errorMessage = "Ocurrió un error al actualizar la contraseña.";
      const error = err as any;
      if (error && typeof error === "object" && "response" in error) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert("Error", errorMessage);
      if (errorMessage.includes("contraseña actual es incorrecta")) {
        setErrors((prev) => ({ ...prev, currentPassword: "La contraseña actual es incorrecta" }));
      }
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every((valid) => valid);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppHeader title="Cambiar contraseña" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <Image style={dynamicStyles.imagePassword} source={require("../assets/images/password.png")} />

              {/* Campos de entrada */}
              {[
                {
                  label: "Contraseña actual",
                  value: currentPassword,
                  setValue: setCurrentPassword,
                  error: errors.currentPassword,
                  secure: true,
                  placeholder: "Ingresa tu contraseña actual",
                },
                {
                  label: "Nueva contraseña",
                  value: newPassword,
                  setValue: setNewPassword,
                  error: errors.newPassword,
                  secure: true,
                  placeholder: "Ingresa tu nueva contraseña",
                },
                {
                  label: "Confirmar nueva contraseña",
                  value: confirmPassword,
                  setValue: setConfirmPassword,
                  error: errors.confirmPassword,
                  secure: true,
                  placeholder: "Confirma tu nueva contraseña",
                },
              ].map((field, i) => (
                <View key={i} style={{ width: "100%" }}>
                  <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { borderColor: colors.inputBorder, color: colors.text },
                      field.error && { borderColor: colors.error },
                      field.value &&
                        (field.value === newPassword && field.label.includes("Nueva") && isPasswordValid()) && {
                          borderColor: colors.success,
                        },
                    ]}
                    secureTextEntry={field.secure}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.placeholder}
                    value={field.value}
                    onChangeText={(text) => {
                      field.setValue(text);
                      setErrors((prev) => ({ ...prev, [field.label]: "" }));
                    }}
                  />
                  {field.error ? (
                    <Text style={[styles.errorText, { color: colors.error }]}>{field.error}</Text>
                  ) : null}
                </View>
              ))}

              {/* Requisitos */}
              <View style={styles.requirementsContainer}>
                {requirements.map((req) => (
                  <Text
                    key={req.id}
                    style={{
                      fontSize: 12,
                      color: passwordRequirements[req.id] ? colors.requirementMet : colors.requirementUnmet,
                      marginVertical: 2,
                    }}
                  >
                    {passwordRequirements[req.id] ? "✓" : "•"} {req.label}
                  </Text>
                ))}
              </View>

              {/* Botón */}
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      loading || !isPasswordValid() || newPassword !== confirmPassword
                        ? colors.buttonDisabled
                        : colors.button,
                  },
                ]}
                onPress={handleChangePassword}
                disabled={loading || !isPasswordValid() || newPassword !== confirmPassword}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Actualizar contraseña</Text>
                )}
              </TouchableOpacity>

              <View style={styles.bottomSpace} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardAvoidView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  container: { padding: 20, alignItems: "center", width: "100%" },
  label: {
    fontSize: 16,
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
  },
  errorText: {
    alignSelf: "flex-start",
    marginTop: 4,
    fontSize: 13,
  },
  button: {
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
  requirementsContainer: {
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
  },
  bottomSpace: {
    height: 80,
  },
});
