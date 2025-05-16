import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "../app/context/AuthContext";
import { useEffect, useState } from "react";
import { neighborhoodService } from "@/app/src/api/services/neighborhood-service";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usersService } from "@/app/src/api/services/users-service";
import { Alert } from "react-native";

interface NeighborhoodUser {
  _id: string;
  email: string;
  name?: string;
}

interface NeighborhoodDetails {
  name: string;
  description?: string;
}

const UserAccountScreen = () => {
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
      console.log("Usuarios del barrio:", data.users);

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

  const fetchNeighborhoodsDetails = async (id) => {
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

              // Actualizar estado para reflejar que ya no está en ninguna comunidad
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
        style={styles.loaderContainer}
        edges={["left", "right", "bottom"]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0056a8" />
        <View style={styles.headerBackground} />
        <ActivityIndicator size="large" color="#32d6a6" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </SafeAreaView>
    );
  }

  if (!hasNeighborhood) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#01579b" />
        <View style={styles.headerBackground} />
        <AppHeader title="Mi comunidad" showBack textColor="#ffffff" />
        <View style={styles.noNeighborhoodContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="home-outline" size={80} color="#CCCCCC" />
          </View>
          <Text style={styles.noNeighborhoodTitle}>
            No perteneces a ninguna comunidad
          </Text>
          <Text style={styles.noNeighborhoodDescription}>
            Actualmente no estás registrado en ningún barrio. Únete a una
            comunidad en Barrios/Grupos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />
      <AppHeader title="Mi comunidad" showBack />

      <View style={styles.contentContainer}>
        {/* Tarjeta de información */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <Text style={styles.infoText}>
            Solo puedes pertenecer a una comunidad. Si deseas unirte a otra,
            deberás salir de la actual y enviar una solicitud para la nueva.
          </Text>
        </View>

        {/* Tarjeta principal de la comunidad */}
        <View style={styles.communityCard}>
          <Image
            source={{
              uri: "https://ecuadors.live/wp-content/uploads/2023/07/pinas-atractivos-turisticos-de-ecuador.jpg",
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          {/* Badge de miembros */}
          <View style={styles.memberBadge}>
            <Ionicons name="people" size={16} color="#ffffff" />
            <Text style={styles.memberBadgeText}>
              {neighborhoodUsers?.length || 0} miembros
            </Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.communityName}>
              {neighborhoodDetails?.name || "Nombre no disponible"}
            </Text>
            <Text style={styles.communityDescription}>
              {`Comunidad organizada del sector ${
                neighborhoodDetails?.name || "desconocido"
              }, unidos por la seguridad y bienestar de todos.`}
            </Text>
          </View>
        </View>

        {/* Botón de salir - Mejorado */}
        <TouchableOpacity
          style={styles.exitButton}
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

        {/* Botón de ver miembros - Mejorado */}
        <TouchableOpacity
          style={styles.membersButton}
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

      {/* Modal corregido con FlatList para mejor rendimiento con muchos usuarios */}
      <Modal
        visible={showMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Cabecera fija del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Miembros de la comunidad</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMembersModal(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* FlatList para renderizado eficiente con muchos usuarios */}
            {neighborhoodUsers && neighborhoodUsers.length > 0 ? (
              <FlatList
                data={neighborhoodUsers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.memberItem}>
                    <View style={styles.avatarContainer}>
                      <Ionicons
                        name="person-circle"
                        size={40}
                        color="#01579b"
                      />
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {item.email && item.email.includes('@') 
                          ? item.email.split("@")[0] 
                          : item.name || 'Usuario'}
                      </Text>
                      <Text style={styles.memberEmail} numberOfLines={1}>
                        {item.email || 'No disponible'}
                      </Text>
                    </View>
                    <View style={styles.memberRoleBadge}>
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
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
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

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#546e7a",
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
    backgroundColor: "#01579b",
  },

  // Estilos para la tarjeta de información
  infoCard: {
    backgroundColor: "#e1f5fe",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoText: {
    marginLeft: 12,
    color: "#2980b9",
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Estilos para la tarjeta principal de la comunidad
  communityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
    elevation: 4,
    shadowColor: "#000",
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
    backgroundColor: "rgba(101, 101, 102, 0.8)",
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
    color: "#01579b",
    marginBottom: 8,
  },
  communityDescription: {
    fontSize: 15,
    color: "#546e7a",
    lineHeight: 22,
  },

  // Estilos para los botones mejorados
  exitButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  membersButton: {
    backgroundColor: '#01579b',
    borderRadius: 12,
    marginTop: 15,
    paddingVertical: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Estilos para el modal mejorado
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.7, // 70% de la altura de la pantalla
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#01579b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
    zIndex: 10, // Asegurar que el header esté siempre visible
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    padding: 10, // Área táctil más grande
    borderRadius: 20,
  },
  // Estilos para FlatList
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    paddingBottom: 20,
  },
  scrollPadding: {
    height: 40, // Espacio adicional al final del scroll
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    color: "#777",
    fontSize: 16,
    textAlign: "center",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#01579b",
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
    color: "#333",
  },
  memberEmail: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  memberRoleBadge: {
    backgroundColor: "#01579b",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },

  // Estilos para la pantalla de "No pertenece a ningún barrio"
  noNeighborhoodContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    backgroundColor: "#f5f5f5",
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
    color: "#01579b",
    marginBottom: 16,
    textAlign: "center",
  },
  noNeighborhoodDescription: {
    fontSize: 16,
    color: "#546e7a",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
});

export default UserAccountScreen;