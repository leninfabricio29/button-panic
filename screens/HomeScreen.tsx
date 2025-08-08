import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Vibration,
  Animated,
  Easing,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/components/AppHeader";

import { useRouter } from "expo-router";
import { useAuth } from "../app/context/AuthContext";
import { mediaService } from "@/app/src/api/services/media-service";
import { fcmService } from "@/app/src/api/services/panic-service";
import * as Location from 'expo-location'; // ✅ nuevo import
//import { PermissionsAndroid, Platform } from 'react-native';

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const resetTimer = useRef<NodeJS.Timeout | null>(null);
  const activeUsers = 20;
  const [adsImages, setAdsImages] = useState<string[]>([]);
  const router = useRouter();


 const getCurrentLocation = async (): Promise<string[] | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso de ubicación denegado', 'Debes permitir acceso a la ubicación para usar el botón SOS.');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const { latitude, longitude } = location.coords;
    return [longitude.toString(), latitude.toString()];
  } catch (error) {
    console.error("❌ Error obteniendo ubicación:", error);
    Alert.alert('Error', 'No se pudo obtener tu ubicación. Asegúrate de tener buena señal GPS.');
    return null;
  }
};

// Función para obtener nombre de usuario para mostrar
const getUserDisplayName = () => {
  if (user && user.name) {
    const parts = user.name.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts[2] || parts[1] || ""; // intenta tomar el 2º apellido, si no existe toma el 1º

    return `${firstName} ${lastName}`;
  }
  return "Usuario";
};

  useEffect(() => {
  const fetchAds = async () => {
    try {
      const adsPackages = await mediaService.getPackagesAdvertising();
      // Extraer todas las imágenes de todos los paquetes
      const allImages = adsPackages.flatMap((pkg: any) =>
        pkg.images.map((img: any) => img.url)
      );
      setAdsImages(allImages);
    } catch (error) {
      console.error("Error al cargar publicidad:", error);
    }
  };

  fetchAds();
}, []);
  // Animación de pulso cuando está activo
  useEffect(() => {
    if (sosActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Configurar el temporizador para resetear después de 30 segundos
      resetTimer.current = setTimeout(() => {
        setSosActive(false);
      }, 4000); // 30 segundos
    } else {
      pulseAnim.setValue(0);
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
    }
  }, [sosActive]);

  const handlePress = async () => {
  if (sosActive) return;

  setSosActive(true); // Activar botón
  Vibration.vibrate([500, 200, 500]);

  // Animación de shake
  Animated.sequence([
    Animated.timing(shakeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim, {
      toValue: -1,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }),
  ]).start();

  try {
    const coords = await getCurrentLocation();
    if (!coords) throw new Error("No se pudo obtener ubicación");

    await fcmService.sendAlarm(coords);
    console.log("✅ Alerta enviada correctamente");
    Alert.alert("Alerta enviada", "Tu alerta SOS ha sido enviada correctamente.");
  } catch (error) {
    Alert.alert("Error", "No se pudo enviar la alerta. Inténtalo de nuevo.");
    console.error("❌ Error al enviar alerta:", error);
  } finally {
    // Espera 3 segundos antes de apagar animación
    setTimeout(() => {
      setSosActive(false);
    }, 3000);
  }
};


  // Interpolaciones
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const shakeTranslateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10],
  });

  // Tiempo restante para el reset automático
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null;
    if (sosActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (interval) {
              clearInterval(interval);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(10);
    }
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [sosActive]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />

      <AppHeader
        title="V- SOS"
        showBack={false}
        rightIcon="settings-outline"
        onRightPress={() => console.log("Settings")}
        titleColor="#f9fafb"
        iconColor="#f9fafb"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bienvenida */}
        <View style={styles.welcomeCard}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcomeText}>
              ¡Hola, {getUserDisplayName()}!
            </Text>
            <Text style={styles.subtitle}>
              Tu seguridad es nuestra prioridad
            </Text>
          </View>
        </View>

        {/* SOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Botón de emergencia</Text>
          <View style={styles.center}>
            <TouchableOpacity
              onPress={handlePress}
              disabled={sosActive}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.sosButton,
                  {
                    backgroundColor: sosActive ? "#e63946" : "#4CAF50",
                    transform: [
                      { scale: pulseScale },
                      { translateX: shakeTranslateX },
                    ],
                  },
                ]}
              >
                <Text style={styles.sosText}>SOS</Text>
                {sosActive && (
                  <>
                    <Animated.View
                      style={[
                        styles.pulseEffect,
                        {
                          opacity: pulseAnim,
                          transform: [{ scale: pulseScale }],
                        },
                      ]}
                    />
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.sosDescription}>
              {sosActive
                ? `Emergencia activada`
                : "Pulsa en caso de emergencia"}
            </Text>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickOptionsGrid}>
            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => router.push("/home/my-contacts")}
            >
              <View
                style={[styles.quickOptionIcon, { backgroundColor: "#FF9800" }]}
              >
                <Ionicons name="people-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Mis Contactos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => router.push("/home/my-account")}
            >
              <View
                style={[styles.quickOptionIcon, { backgroundColor: "blue" }]}
              >
                <Ionicons name="radio-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Mi Comunidad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => router.push("/home/neighborhood")}
            >
              <View
                style={[styles.quickOptionIcon, { backgroundColor: "#9C27B0" }]}
              >
                <Ionicons name="business-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Barrios/Grupos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => router.push("/home/secure-zone")}
            >
              <View
                style={[styles.quickOptionIcon, { backgroundColor: "#E91E63" }]}
              >
                <Ionicons  name="shield-checkmark"  size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Zona Segura</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promociones */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Publicidad</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {adsImages.map((url, index) => (
      <Image
        key={index}
        source={{ uri: url }}
        style={styles.promoImageOnly}
      />
    ))}
  </ScrollView>
</View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#01579b" />
              <Text style={styles.statValue}>+ {activeUsers}</Text>
              <Text style={styles.statLabel}>Usuarios activos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="shield-checkmark" size={24} color="#01579b" />
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Protección</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="alert-circle" size={24} color="#01579b" />
              <Text style={styles.statValue}>-3min</Text>
              <Text style={styles.statLabel}>Tiempo de respuesta</Text>
            </View>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContent: {
    padding: 16,
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e1f5fe",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#01579b",
  },
  subtitle: {
    fontSize: 14,
    color: "#546e7a",
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  center: {
    alignItems: "center",
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  sosText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    zIndex: 2,
  },

  sosDescription: {
    marginTop: 15,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  pulseEffect: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 1,
  },

  quickOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickOption: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e1f5fe",
  },
  quickOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickOptionText: {
    fontSize: 14,
    color: "#37474f",
    textAlign: "center",
  },
  promoCard: {
    backgroundColor: "#f5f9ff",
    width: width * 0.7,
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e1f5fe",
  },
  promoImage: {
    height: 110,
    borderRadius: 10,
    marginBottom: 8,
  },
  promoTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#01579b",
  },
  promoText: {
    fontSize: 13,
    color: "#546e7a",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#01579b",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#546e7a",
    marginTop: 2,
    textAlign: "center",
  },
  promoImageOnly: {
  width: width * 0.7,
  height: 250,
  borderRadius: 12,
  marginRight: 16,
  backgroundColor: "#e0f7fa",
}

});
