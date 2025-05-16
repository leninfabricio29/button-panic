import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Modal
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "../app/context/AuthContext";
import { useEffect, useState } from "react";
import { neighborhoodService } from "@/app/src/api/services/neighborhood-service";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usersService } from "@/app/src/api/services/users-service";

import { Alert } from "react-native";

const { width } = Dimensions.get("window");

const CommunityScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [neighborhoodUsers, setNeighborhoodUsers] = useState([]);
  const [neighborhoodDetails, setNeighborhoodDetails] = useState(null);
  const [hasNeighborhood, setHasNeighborhood] = useState(true);
  const [neighborhoodID, setNeighborhoodID] = useState(null);
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

  const fetchNeighborhoodsByUsers = async (id) => {
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

            await neighborhoodService.exitNeighborhood(neighborhoodID, user._id);
            
            // Actualizar estado para reflejar que ya no está en ninguna comunidad
            setHasNeighborhood(false);
            setNeighborhoodUsers([]);
            setNeighborhoodDetails(null);
            setNeighborhoodID(null);
          } catch (error) {
            console.error("Error al salir de la comunidad:", error);
            Alert.alert("Error", "No se pudo salir de la comunidad. Intenta más tarde.");
          }
        },
      },
    ]
  );
};


  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer} edges={['left', 'right', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0056a8" />
        <View style={styles.headerBackground} />
        <ActivityIndicator size="large" color="#32d6a6" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </SafeAreaView>
    );
  }

  if (!hasNeighborhood) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />
      <View  />
      <AppHeader title="Mi comunidad" showBack  />

      <View style={styles.contentContainer}>
        {/* Tarjeta principal de la comunidad */}

        {/* Tarjeta de información */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <Text style={styles.infoText}>
            Solo puedes pertenecer a una comunidad. Si deseas unirte a otra,
            deberás salir de la actual y enviar una solicitud para la nueva.
          </Text>
        </View>

        <View style={styles.communityCard}>
          <Image
            source={{
              uri: "https://ecuadors.live/wp-content/uploads/2023/07/pinas-atractivos-turisticos-de-ecuador.jpg",
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          
          {/* Overlay con gradiente para mejor legibilidad */}
         
          
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

        

        {/* Botón de salir */}
        <TouchableOpacity 
          style={styles.exitButton}
          onPress={handleExitCommunity}
        >
          <Ionicons name="exit-outline" size={20} color="#ffffff" style={styles.exitIcon} />
          <Text style={styles.exitButtonText}>Salir de comunidad</Text>
        </TouchableOpacity>

        {/* Lista de miembros */}
        <View style={styles.membersSection}>
          <TouchableOpacity
  style={styles.seeButton}
  onPress={() => setShowMembersModal(true)}
>
  <Ionicons name="people" size={20} color="#fff" style={styles.exitIcon} />
  <Text style={styles.exitButtonText}>Ver miembros de la comunidad</Text>
</TouchableOpacity>
        </View>
      </View>

     <Modal
  visible={showMembersModal}
  animationType="fade"
  transparent={true}
  onRequestClose={() => setShowMembersModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Miembros de la comunidad</Text>
        <TouchableOpacity onPress={() => setShowMembersModal(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={neighborhoodUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Ionicons name="person-circle" size={40} color="#01579b" />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberEmail}>{item.email}</Text>
              <Text style={styles.memberRole}>Miembro</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Sin miembros registrados.</Text>}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  </View>
</Modal>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '90%',
  maxHeight: '80%',
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  elevation: 10,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#01579b',
},

  
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
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
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  memberBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(101, 101, 102, 0.8)',
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
  
  // Tarjeta de información
  infoCard: {
    backgroundColor: '#e1f5fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoText: {
    marginLeft: 12,
    color: '#2980b9',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Botón de salir
  exitButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  exitIcon: {
    marginRight: 8,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  seeButton:{
backgroundColor: 'indigo',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,  }
  ,
  // Sección de miembros
  membersSection: {
    marginTop: 24,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#01579b",
    marginBottom: 16,
  },
  membersList: {
    paddingBottom: 20,
  },
  memberCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberAvatar: {
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 16,
    fontWeight: "500",
    color: "#01579b",
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: "#78909c",
  },
  
  // Estilos para la pantalla de "No pertenece a ningún barrio"
  noNeighborhoodContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    backgroundColor: '#f5f5f5',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
  joinButton: {
    backgroundColor: "#32d6a6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  joinButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CommunityScreen;