import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../app/context/AuthContext";
import messaging from "@react-native-firebase/messaging";
import { fcmService } from "@/app/src/api/services/panic-service";

function RootNavigation() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Redirección basada en autenticación
  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, segments]);

  // Setup FCM: obtener y guardar token
  useEffect(() => {
    const setupFCM = async () => {
      try {
        const token = await messaging().getToken();
        console.log("📲 Token inicial FCM:", token);
        await fcmService.saveToken(token);

        const unsubscribeRefresh = messaging().onTokenRefresh(async newToken => {
          console.log("🔁 Nuevo token FCM:", newToken);
          await fcmService.saveToken(newToken);
        });

        return unsubscribeRefresh;
      } catch (err) {
        console.error("❌ Error en setupFCM:", err);
      }
    };

    if (isAuthenticated) {
      setupFCM();
    }
  }, [isAuthenticated]);

  // Escuchar notificaciones en foreground
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log("📩 Mensaje recibido en foreground:", remoteMessage);
      const { title, body } = remoteMessage.notification ?? {};
      if (title && body) {
        Alert.alert(title, body);
      }
    });

    return () => {
      unsubscribeOnMessage();
    };
  }, [isAuthenticated]);

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
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
