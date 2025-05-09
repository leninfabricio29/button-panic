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
  ActivityIndicator,
  Vibration,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/components/AppHeader";
import { useRouter } from "expo-router";
import { useAuth } from "../app/context/AuthContext";

const { width } = Dimensions.get("window");
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const resetTimer = useRef(null);
  const activeUsers = 52;
  const router = useRouter();

  // Función para obtener nombre de usuario para mostrar
  const getUserDisplayName = () => {
    if (user && user.name) {
      return user.name;
    }
    return "Usuario";
  };

  useEffect(() => {
    const checkPolicyAgreement = async () => {
      const accepted = await AsyncStorage.getItem("policyAccepted");
      if (accepted !== "true") {
        setShowPolicyModal(true);
      }
    };
    checkPolicyAgreement();

    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
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
      }, 10000); // 30 segundos
    } else {
      pulseAnim.setValue(0);
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
    }
  }, [sosActive]);

  const handlePress = () => {
    // Si ya está activo, no hacer nada
    if (sosActive) return;

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

    // Vibración y activación
    Vibration.vibrate([500, 200, 500]);
    setSosActive(true);
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
    let interval;
    if (sosActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(10);
    }
    return () => clearInterval(interval);
  }, [sosActive]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />

      <AppHeader
        title="SafeGuard"
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
              onPress={() => router.push("/home/faq-question")}
            >
              <View
                style={[styles.quickOptionIcon, { backgroundColor: "#E91E63" }]}
              >
                <Ionicons name="help-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Preguntas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promociones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promociones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.promoCard}>
              <Image
                source={{
                  uri: "https://cablefamilia.com/wp-content/uploads/2024/05/movil.png",
                }}
                style={styles.promoImage}
              />
              <Text style={styles.promoTitle}>Nuevo Plan</Text>
              <Text style={styles.promoText}>
                Conoce nuestro plan familiar con nuevos beneficios.
              </Text>
            </View>
            <View style={styles.promoCard}>
              <Image
                source={{
                  uri: "https://pbs.twimg.com/media/FOJwku0WQAQS1z6.jpg",
                }}
                style={styles.promoImage}
              />
              <Text style={styles.promoTitle}>Seguridad Avanzada</Text>
              <Text style={styles.promoText}>
                Nuestras nuevas funciones de seguridad ya están aquí.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#01579b" />
              <Text style={styles.statValue}>{activeUsers}</Text>
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
});
