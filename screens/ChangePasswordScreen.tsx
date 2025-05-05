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
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { authService } from "../app/src/api/services/auth-service";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "expo-router";

// Tipo para los requisitos de contraseña
type PasswordRequirement = {
  label: string;
  validator: (password: string) => boolean;
  id: string;
};

export default function ChangePasswordScreen() {
  const router = useRouter(); // Usar useRouter en lugar de navigation
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
  
  // Obtener usuario del contexto de autenticación
  const { user, logout } = useAuth(); // También añadimos logout del contexto

  // Definir los requisitos de la contraseña
  const requirements: PasswordRequirement[] = [
    {
      id: "length",
      label: "Al menos 8 caracteres",
      validator: (password) => password.length >= 8,
    },
    {
      id: "uppercase",
      label: "Al menos una mayúscula",
      validator: (password) => /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "Al menos una minúscula",
      validator: (password) => /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "Al menos un número",
      validator: (password) => /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "Al menos un símbolo especial",
      validator: (password) => /[\W_]/.test(password),
    },
  ];

  // Validar la contraseña en tiempo real
  useEffect(() => {
    const newRequirements: { [key: string]: boolean } = {};
    requirements.forEach((req) => {
      newRequirements[req.id] = req.validator(newPassword);
    });
    setPasswordRequirements(newRequirements);
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
    // Validaciones
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

    // Verificar que tengamos el email del usuario
    if (!user?.email) {
      Alert.alert("Error", "No se pudo obtener el email del usuario. Por favor, inicia sesión nuevamente.");
      return;
    }

    setLoading(true);
    
    try {
      // Llamar al servicio de actualización de contraseña
      await authService.updatePassword({
        email: user.email,
        currentPassword,
        newPassword
      });
      
      // Mostrar mensaje de éxito y redireccionar al login
      Alert.alert(
        "Éxito", 
        "Tu contraseña ha sido actualizada correctamente. Por favor inicia sesión nuevamente.", 
        [
          { 
            text: "OK", 
            onPress: async () => {
              // Limpiar el formulario
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setErrors({});
              
              // Cerrar sesión
              await logout();
              
              // Redireccionar a login
              router.push('/auth/login');
            } 
          }
        ]
      );
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      
      // Mostrar mensaje de error adecuado según la respuesta del servidor
      let errorMessage = "Ocurrió un error al actualizar la contraseña.";
      
      // Usar tipado seguro para TypeScript
      const error = err as any;
      if (error && typeof error === 'object' && 'response' in error) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert("Error", errorMessage);
      
      // Si el error es de contraseña incorrecta, marcamos ese campo
      if (errorMessage.includes("contraseña actual es incorrecta")) {
        setErrors(prev => ({...prev, currentPassword: "La contraseña actual es incorrecta"}));
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar si todos los requisitos se cumplen
  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every((valid) => valid);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Cambiar contraseña" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.container}>
              <Image
                style={styles.imagePassword}
                source={require("../assets/images/password.png")}
              />

              <Text style={styles.label}>Contraseña actual</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.currentPassword ? styles.inputError : null,
                ]}
                secureTextEntry
                placeholder="Ingresa tu contraseña actual"
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setErrors((prev) => ({ ...prev, currentPassword: "" }));
                }}
              />
              {errors.currentPassword ? (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              ) : null}

              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.newPassword ? styles.inputError : null,
                  isPasswordValid() && newPassword ? styles.inputSuccess : null,
                ]}
                secureTextEntry
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
              />

              {/* Mostrar requisitos de contraseña */}
              <View style={styles.requirementsContainer}>
                {requirements.map((req) => (
                  <View key={req.id} style={styles.requirementItem}>
                    <Text
                      style={[
                        styles.requirementText,
                        passwordRequirements[req.id]
                          ? styles.requirementMet
                          : styles.requirementUnmet,
                      ]}
                    >
                      {passwordRequirements[req.id] ? "✓" : "•"} {req.label}
                    </Text>
                  </View>
                ))}
              </View>

              {errors.newPassword ? (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              ) : null}

              <Text style={styles.label}>Confirmar nueva contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword ? styles.inputError : null,
                  confirmPassword && newPassword === confirmPassword
                    ? styles.inputSuccess
                    : null,
                ]}
                secureTextEntry
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  (loading || !isPasswordValid() || newPassword !== confirmPassword) &&
                    styles.buttonDisabled,
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
              
              {/* Espacio adicional al final para asegurar que el último elemento sea visible */}
              <View style={styles.bottomSpace} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Añadir espacio en la parte inferior
  },
  container: {
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  imagePassword: {
    width: "90%",
    height: 150, // Reducido para dejar más espacio a los inputs
    resizeMode: "contain", // Cambiado para mejor visualización
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#01579b",
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
  inputSuccess: {
    borderColor: "green",
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
  buttonDisabled: {
    backgroundColor: "#cccccc",
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
  requirementItem: {
    marginVertical: 2,
  },
  requirementText: {
    fontSize: 12,
  },
  requirementMet: {
    color: "green",
  },
  requirementUnmet: {
    color: "gray",
  },
  bottomSpace: {
    height: 80, // Espacio adicional al final
  },
});