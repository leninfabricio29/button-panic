import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../app/context/AuthContext";

const SettingsScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const colors = isDarkMode
    ? {
        background: "#121212",
        cardBackground: "#1E1E1E",
        border: "#333",
        text: "#FFF",
        icon: "#64B5F6",
      }
    : {
        background: "#FFFFFF",
        cardBackground: "#FFFFFF",
        border: "#e1f5fe",
        text: "#2e1f0f",
        icon: "#5c4033",
      };

  const handleLogout = async () => {
    await logout();
  };

  const settings = [
    {
      icon: "person-circle-outline",
      label: "Editar perfil",
      onPress: () => router.push("settings/edit-profile"),
    },
    {
      icon: "lock-closed-outline",
      label: "Cambiar contraseña",
      onPress: () => router.push("settings/change-password"),
    },
    {
      icon: "log-out-outline",
      label: "Cerrar sesión",
      onPress: () => handleLogout(),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Configuraciones" />
      <ScrollView contentContainerStyle={styles.grid}>
        {settings.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: isDarkMode ? "#000" : "#000",
                elevation: 6,
              }
            ]}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon}
              size={28}
              color={colors.icon}
              style={styles.icon}
            />
            <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 2,
    width: "50%",
    height: "20%",
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginRight: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    borderRadius: 12,
  },
  icon: {
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default SettingsScreen;

