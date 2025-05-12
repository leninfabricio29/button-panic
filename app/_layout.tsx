import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../app/context/AuthContext";
import messaging from '@react-native-firebase/messaging';
import { fcmService } from '@/app/src/api/services/panic-service';

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

  useEffect(() => {
    const setupFCM = async () => {
      try {
        const token = await messaging().getToken();
        console.log("📲 Token inicial FCM:", token);
        await fcmService.saveToken(token);

        // Escuchar actualizaciones de token
        const unsubscribe = messaging().onTokenRefresh(async newToken => {
          console.log("🔁 Nuevo token FCM:", newToken);
          await fcmService.saveToken(newToken);
        });

        return unsubscribe;
      } catch (err) {
        console.error("❌ Error en setupFCM:", err);
      }
    };

    if (isAuthenticated) {
      setupFCM();
    }
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
