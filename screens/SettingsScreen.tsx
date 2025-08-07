// app/screens/SettingsScreen.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { useAuth } from "../app/context/AuthContext"; // nuevo import

const SettingsScreen = () => {
  const router = useRouter(); // ✅ Aquí sí está permitido
  const { logout } = useAuth(); // nuevo hook

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro de que quieres cerrar sesión?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Cerrar sesión",
            style: "destructive",
            onPress: async () => {
              await logout();
              // Redirect to login or auth screen after logout
              router.replace("/auth/login");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión");
    }
  };

  const settings = [
    {
      icon: "person-circle-outline" as const,
      label: "Editar perfil",
      onPress: () => router.push("/settings/edit-profile"),
    },
    {
      icon: "lock-closed-outline" as const,
      label: "Cambiar contraseña",
      onPress: () => router.push("/settings/change-password"),
    },

    {
      icon: "log-out-outline" as const,
      label: "Cerrar sesión",
      onPress: () => handleLogout(),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Configuraciones" />
      <ScrollView contentContainerStyle={styles.grid}>
        {settings.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon}
              size={28}
              color="#5c4033"
              style={styles.icon}
            />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    height: "100%",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e1f5fe",
    width: "50%",
    height: "20%",
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginRight: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
  icon: {
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2e1f0f",
    textAlign: "center",
  },
});

export default SettingsScreen;
