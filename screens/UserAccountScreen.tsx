import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  Dimensions,
  Alert,
  useColorScheme,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "../app/context/AuthContext";
import { useEffect, useState } from "react";
import { neighborhoodService } from "@/app/src/api/services/neighborhood-service";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usersService } from "@/app/src/api/services/users-service";

interface NeighborhoodUser {
  _id: string;
  email: string;
  name?: string;
}

interface NeighborhoodDetails {
  name: string;
  description?: string;
}

const { height } = Dimensions.get('window');

const UserAccountScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#f5f7fa",
    text: isDark ? "#e0e0e0" : "#333",
    subText: isDark ? "#aaaaaa" : "#777",
    primary: isDark ? "#90caf9" : "#01579b",
    cardBackground: isDark ? "#1e1e1e" : "#fff",
    infoCardBackground: isDark ? "#263238" : "#e1f5fe",
    infoCardBorder: isDark ? "#64b5f6" : "#3498db",
    shadowColor: isDark ? "#000" : "#000",
    buttonExitBackground: "#f44336", // rojo, queda igual
    buttonMembersBackground: "#01579b",
    modalBackground: isDark ? "#222" : "#fff",
    modalOverlay: "rgba(0,0,0,0.7)",
    emptyText: isDark ? "#888" : "#777",
    borderColor: isDark ? "#444" : "#01579b",
  };

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [neighborhoodUsers, setNeighborhoodUsers] = useState<NeighborhoodUser[]>([]);
  const [neighborhoodDetails, setNeighborhoodDetails] = useState<NeighborhoodDetails | null>(null);
  const [hasNeighborhood, setHasNeighborhood] = useState(true);
  const [neighborhoodID, setNeighborhoodID] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const data = await usersService.getUserById(user._id);
      setNeighborhoodID(data.neighborhood);
      return data.neighborhood;
    } catch (error) {
      console.log("Error al obtener la información del usuario");
      return null;
    }
  };

  const fetchNeighborhoodsByUsers = async (id: string) => {
    try {
      if (!id) {
        setHasNeighborhood(false);
        return;
      }

      const data = await neighborhoodService.getNeighborhoodUsers(id);
      if (!data?.users?.length) {
        setHasNeighborhood(false);
      } else {
        setNeighborhoodUsers(data.users);
      }
    } catch (error) {
      console.error("Error cargando usuarios del barrio:", error);
      setHasNeighborhood(false);
    }
  };

  const fetchNeighborhoodsDetails = async (id: any) => {
    try {
      if (!id) {
        setHasNeighborhood(false);
        return;
      }

      const data = await neighborhoodService.getNeighborhoodDetails(id);

      if (!data?.neighborhood) {
        setHasNeighborhood(false);
      } else {
        setNeighborhoodDetails(data.neighborhood);
      }
    } catch (error) {
      console.error("Error cargando detalles del barrio:", error);
      setHasNeighborhood(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const neighborhoodId = await fetchUserDetails();

      if (neighborhoodId) {
        await Promise.all([
          fetchNeighborhoodsByUsers(neighborhoodId),
          fetchNeighborhoodsDetails(neighborhoodId),
        ]);
      } else {
        setHasNeighborhood(false);
      }

      setLoading(false);
    };

    loadData();
  }, [user._id]);

  const handleExitCommunity = () => {
    Alert.alert(
      "Confirmar salida",
      "¿Estás seguro de que deseas salir de esta comunidad?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              if (!neighborhoodID || !user._id) return;

              await neighborhoodService.exitNeighborhood(
                neighborhoodID,
                user._id
              );

              setHasNeighborhood(false);
              setNeighborhoodUsers([]);
              setNeighborhoodDetails(null);
              setNeighborhoodID(null);
            } catch (error) {
              console.error("Error al salir de la comunidad:", error);
              Alert.alert(
                "Error",
                "No se pudo salir de la comunidad. Intenta más tarde."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.loaderContainer, { backgroundColor: colors.background }]}
        edges={["left", "right", "bottom"]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary} />
        <View style={[styles.headerBackground, { backgroundColor: colors.primary }]} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subText }]}>Cargando información...</Text>
      </SafeAreaView>
    );
  }

  if (!hasNeighborhood) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["left", "right", "bottom"]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary} />
        <View style={[styles.headerBackground, { backgroundColor: colors.primary }]} />
        <AppHeader title="Mi comunidad" showBack />
        <View style={styles.noNeighborhoodContainer}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? "#333" : "#f5f5f5" }]}>
            <Ionicons name="home-outline" size={80} color={colors.subText} />
          </View>
          <Text style={[styles.noNeighborhoodTitle, { color: colors.primary }]}>
            No perteneces a ninguna comunidad
          </Text>
          <Text style={[styles.noNeighborhoodDescription, { color: colors.subText }]}>
            Actualmente no estás registrado en ningún barrio. Únete a una
            comunidad en Barrios/Grupos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary} />
      <AppHeader title="Mi comunidad" showBack />

      <View style={styles.contentContainer}>
        <View style={[styles.infoCard, { backgroundColor: colors.infoCardBackground, borderLeftColor: colors.infoCardBorder }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Solo puedes pertenecer a una comunidad. Si deseas unirte a otra,
            deberás salir de la actual y enviar una solicitud para la nueva.
          </Text>
        </View>

        <View style={[styles.communityCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
          <Image
            source={{
              uri: "https://ecuadors.live/wp-content/uploads/2023/07/pinas-atractivos-turisticos-de-ecuador.jpg",
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          <View style={[styles.memberBadge, { backgroundColor: "rgba(101, 101, 102, 0.8)" }]}>
            <Ionicons name="people" size={16} color="#ffffff" />
            <Text style={styles.memberBadgeText}>
              {neighborhoodUsers?.length || 0} miembros
            </Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={[styles.communityName, { color: colors.primary }]}>
              {neighborhoodDetails?.name || "Nombre no disponible"}
            </Text>
            <Text style={[styles.communityDescription, { color: colors.subText }]}>
              {`Comunidad organizada del sector ${
                neighborhoodDetails?.name || "desconocido"
              }, unidos por la seguridad y bienestar de todos.`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.exitButton, { backgroundColor: colors.buttonExitBackground }]}
          onPress={handleExitCommunity}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="exit-outline"
              size={22}
              color="#ffffff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Salir de comunidad</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.membersButton, { backgroundColor: colors.buttonMembersBackground }]}
          onPress={() => setShowMembersModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="people"
              size={22}
              color="#ffffff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Ver miembros</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalTitle}>Miembros de la comunidad</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMembersModal(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {neighborhoodUsers && neighborhoodUsers.length > 0 ? (
              <FlatList
                data={neighborhoodUsers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={[styles.memberItem, { borderBottomColor: colors.borderColor }]}>
                    <View style={styles.avatarContainer}>
                      <Ionicons
                        name="person-circle"
                        size={40}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                        {item.email && item.email.includes('@')
                          ? item.email.split("@")[0]
                          : item.name || 'Usuario'}
                      </Text>
                      <Text style={[styles.memberEmail, { color: colors.subText }]} numberOfLines={1}>
                        {item.email || 'No disponible'}
                      </Text>
                    </View>
                    <View style={[styles.memberRoleBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.roleText}>Miembro</Text>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={
                  neighborhoodUsers.length === 0 ? styles.emptyListContent : styles.listContent
                }
                ListFooterComponent={<View style={styles.scrollPadding} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.emptyText} />
                <Text style={[styles.emptyText, { color: colors.emptyText }]}>
                  No hay miembros registrados
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
  },

  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  communityCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    height: 180,
    width: "100%",
  },
  memberBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberBadgeText: {
    marginLeft: 6,
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  cardContent: {
    padding: 20,
  },
  communityName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  communityDescription: {
    fontSize: 15,
    lineHeight: 22,
  },

  exitButton: {
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 15,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  membersButton: {
    borderRadius: 12,
    marginTop: 15,
    paddingVertical: 15,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
    zIndex: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },

  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollPadding: {
    height: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginRight: 15,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  memberEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  memberRoleBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },

  noNeighborhoodContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noNeighborhoodTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  noNeighborhoodDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
});

export default UserAccountScreen;
