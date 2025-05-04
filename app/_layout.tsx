import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../app/context/AuthContext";
//import '../utils/firebase-config'
import messaging from "@react-native-firebase/messaging";

function RootNavigation() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, segments]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#32d6a6" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function Layout() {
  useEffect(() => {
    // Puedes manejar mensajes en primer plano si quieres aquí
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("Mensaje recibido en foreground:", remoteMessage);
      // Puedes mostrar una alerta, navegación o lógica aquí
    });

    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
