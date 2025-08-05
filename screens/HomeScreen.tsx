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
  Modal,
  Alert,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/components/AppHeader";

import { useRouter } from "expo-router";
import { useAuth } from "../app/context/AuthContext";
import { mediaService } from "@/app/src/api/services/media-service";
import { fcmService } from "@/app/src/api/services/panic-service";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Estado para el tema
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");

  const resetTimer = useRef<NodeJS.Timeout | null>(null);
  const activeUsers = 20;
  const [adsImages, setAdsImages] = useState<string[]>([]);
  const router = useRouter();

  const pubImages = [require("../assets/images/softkilla_pub.png")];

  const [showAdModal, setShowAdModal] = useState(false);
  const [randomAdImage, setRandomAdImage] = useState<string | null>(null);

  // Función para alternar el tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Colores dinámicos basados en el tema
  const getThemeColors = () => {
    return isDarkMode
      ? {
          // 🎨 Modo oscuro
          background: "#121212",
          surface: "#1e1e1e",
          surfaceVariant: "#2d2d2d",
          primary: "#64b5f6",
          primaryVariant: "#1976d2",
          secondary: "#81c784",
          text: "#ffffff",
          textSecondary: "#b0b0b0",
          textMuted: "#757575",
          border: "#333333",
          card: "#1e1e1e",
          welcomeCard: "#2d2d2d",
          statsCard: "#242424",
          quickOption: "#2d2d2d",
          modalBackground: "rgba(0, 0, 0, 0.8)",
          statusBar: "light-content",
          headerBackground: "#1e1e1e",
          headerTitle: "#ffffff",
          headerIcon: "#64b5f6",
          quickOptionIcons: {
            contacts: "#F57C00", // naranja
            community: "#64b5f6", // azul claro
            neighborhood: "#BA68C8", // púrpura claro
            safezone: "#EC407A", // rosa fuerte
          },
        }
      : {
          // ☀️ Modo claro
          background: "#ffffff",
          surface: "#f5f5f5",
          surfaceVariant: "#f9f9f9",
          primary: "#01579b",
          primaryVariant: "#0277bd",
          secondary: "#4caf50",
          text: "#333333",
          textSecondary: "#546e7a",
          textMuted: "#666666",
          border: "#e1f5fe",
          card: "#ffffff",
          welcomeCard: "#f5f9ff",
          statsCard: "#ffffff",
          quickOption: "#ffffff",
          modalBackground: "rgba(0, 0, 0, 0.6)",
          statusBar: "dark-content",
          headerBackground: "#01579b",
          headerTitle: "#f9fafb",
          headerIcon: "#f9fafb",
          quickOptionIcons: {
            contacts: "#FB8C00",
            community: "#0277BD",
            neighborhood: "#AB47BC",
            safezone: "#D81B60",
          },
        };
  };

  const colors = getThemeColors();

  const getCurrentLocation = async (): Promise<string[] | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso de ubicación denegado",
          "Debes permitir acceso a la ubicación para usar el botón SOS."
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const { latitude, longitude } = location.coords;
      return [longitude.toString(), latitude.toString()];
    } catch (error) {
      console.error("❌ Error obteniendo ubicación:", error);
      Alert.alert(
        "Error",
        "No se pudo obtener tu ubicación. Asegúrate de tener buena señal GPS."
      );
      return null;
    }
  };

  const showRandomAd = () => {
    if (pubImages.length === 0) return;

    const randomIndex = Math.floor(Math.random() * pubImages.length);
    const image = pubImages[randomIndex];
    setRandomAdImage(image);
    setShowAdModal(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      showRandomAd();
    }, 80000);

    return () => clearInterval(interval);
  }, [adsImages]);

  const getUserDisplayName = () => {
    if (user && user.name) {
      const parts = user.name.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts[2] || parts[1] || "";

      return `${firstName} ${lastName}`;
    }
    return "Usuario";
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsPackages = await mediaService.getPackagesAdvertising();
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

      resetTimer.current = setTimeout(() => {
        setSosActive(false);
      }, 4000);
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

    setSosActive(true);
    Vibration.vibrate([500, 200, 500]);

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
      Alert.alert(
        "Alerta enviada",
        "Tu alerta SOS ha sido enviada correctamente."
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la alerta. Inténtalo de nuevo.");
      console.error("❌ Error al enviar alerta:", error);
    } finally {
      setTimeout(() => {
        setSosActive(false);
      }, 3000);
    }
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const shakeTranslateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10],
  });

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.headerBackground}
      />

      <AppHeader
        title="Viryx SOS"
        showBack={false}
        rightIcon={isDarkMode ? "sunny-outline" : "moon-outline"}
        onRightPress={toggleTheme}
        titleColor={colors.headerTitle}
        iconColor={colors.headerIcon}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bienvenida */}
        <View
          style={[
            styles.welcomeCard,
            { backgroundColor: colors.welcomeCard, borderColor: colors.border },
          ]}
        >
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.welcomeText, { color: colors.primary }]}>
              ¡Hola, {getUserDisplayName()}!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Tu seguridad es nuestra prioridad
            </Text>
          </View>
        </View>

        {/* SOS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Botón de emergencia
          </Text>
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

            <Text style={[styles.sosDescription, { color: colors.textMuted }]}>
              {sosActive
                ? `Emergencia activada`
                : "Pulsa en caso de emergencia"}
            </Text>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acciones rápidas
          </Text>
          <View style={styles.quickOptionsGrid}>
            {/* Mis Contactos */}
            <TouchableOpacity
              style={[
                styles.quickOption,
                {
                  backgroundColor: colors.quickOption,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/home/my-contacts")}
            >
              <View
                style={[
                  styles.quickOptionIcon,
                  { backgroundColor: colors.quickOptionIcons.contacts },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={colors.headerTitle}
                />
              </View>
              <Text
                style={[
                  styles.quickOptionText,
                  { color: colors.textSecondary },
                ]}
              >
                Mis Contactos
              </Text>
            </TouchableOpacity>

            {/* Mi Comunidad */}
            <TouchableOpacity
              style={[
                styles.quickOption,
                {
                  backgroundColor: colors.quickOption,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/home/my-account")}
            >
              <View
                style={[
                  styles.quickOptionIcon,
                  { backgroundColor: colors.quickOptionIcons.community },
                ]}
              >
                <Ionicons
                  name="radio-outline"
                  size={24}
                  color={colors.headerTitle}
                />
              </View>
              <Text
                style={[
                  styles.quickOptionText,
                  { color: colors.textSecondary },
                ]}
              >
                Mi Comunidad
              </Text>
            </TouchableOpacity>

            {/* Barrios/Grupos */}
            <TouchableOpacity
              style={[
                styles.quickOption,
                {
                  backgroundColor: colors.quickOption,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/home/neighborhood")}
            >
              <View
                style={[
                  styles.quickOptionIcon,
                  { backgroundColor: colors.quickOptionIcons.neighborhood },
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={colors.headerTitle}
                />
              </View>
              <Text
                style={[
                  styles.quickOptionText,
                  { color: colors.textSecondary },
                ]}
              >
                Barrios/Grupos
              </Text>
            </TouchableOpacity>

            {/* Zona Segura */}
            <TouchableOpacity
              style={[
                styles.quickOption,
                {
                  backgroundColor: colors.quickOption,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/home/secure-zone")}
            >
              <View
                style={[
                  styles.quickOptionIcon,
                  { backgroundColor: colors.quickOptionIcons.safezone },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={colors.headerTitle}
                />
              </View>
              <Text
                style={[
                  styles.quickOptionText,
                  { color: colors.textSecondary },
                ]}
              >
                Zona Segura
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promociones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Publicidad
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {adsImages.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={[
                  styles.promoImageOnly,
                  { backgroundColor: isDarkMode ? "#333333" : "#e0f7fa" },
                ]}
              />
            ))}
          </ScrollView>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Estadísticas
          </Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.statsCard,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                + {activeUsers}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Usuarios activos
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.statsCard,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                24/7
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Protección
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.statsCard,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="alert-circle" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                -3min
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Tiempo de respuesta
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAdModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.modalBackground,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 2,
              alignItems: "center",
              maxWidth: "100%",
              borderRadius: 8,
            }}
          >
            {randomAdImage && (
              <Image
                style={{ width: 300, height: 350, borderRadius: 5 }}
                resizeMode="cover"
              />
            )}
          </View>
          <TouchableOpacity onPress={() => setShowAdModal(false)}>
            <Text
              style={[
                styles.buttonCancelar,
                { backgroundColor: "#e53935", color: "#ffffff" },
              ]}
            >
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonCancelar: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 80,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
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
  },
  subtitle: {
    fontSize: 14,
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
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
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
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
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  promoImageOnly: {
    width: width * 0.7,
    height: 250,
    borderRadius: 12,
    marginRight: 16,
  },
});
