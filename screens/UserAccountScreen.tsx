/* // app/screens/UserAccountScreen.tsx*/

import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "../app/context/AuthContext"; // Asegúrate de ajustar esta ruta
import { useEffect, useState } from "react";
import { neighborhoodService } from "@/app/src/api/services/neighborhood-service";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CommunityScreen = () => {
  const { user } = useAuth(); // Obtener el usuario autenticado
  const [loading, setLoading] = useState(true);
  const [neighborhoodUsers, setNeighborhoodUsers] = useState([]);
  const [neighborhoodDetails, setNeighborhoodDetails] = useState(null);

  //Obtener los usuarios que pertenecen al barrio
  const fetchNeighborhoodsByUsers = async () => {
    try {
      //console.log("barrio del usuario:", user);
      // Aquí deberías llamar a tu servicio para obtener los barrios
      const data = await neighborhoodService.getNeighborhoodUsers(
        user.neighborhood
      );
      console.log("Barrios:", data);
      setNeighborhoodUsers(data.users);
    } catch (error) {
      console.error("Error cargando barrios:", error);
    } finally {
      setLoading(false);
    }
  };

  //Obtener la informacion del barrio
  const fetchNeighborhoodsDetails = async () => {
    try {
      // Aquí deberías llamar a tu servicio para obtener los barrios
      const data = await neighborhoodService.getNeighborhoodDetails(
        user.neighborhood
      );
      console.log("Barrio Details:", data.neighborhood);
      // Añadimos una imagen aleatoria al barrio

      setNeighborhoodDetails(data.neighborhood);
    } catch (error) {
      console.error("Error cargando barrios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeighborhoodsByUsers();
    fetchNeighborhoodsDetails();
    /*  console.log("user", user);
    console.log("neighborhoodUsers", neighborhoodUsers);
    console.log("neighborhoodDetails", neighborhoodDetails); */
  }, []);

  if (loading) {
    return (
      <SafeAreaView>
        <ActivityIndicator
          size="large"
          color="#32d6a6"
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Mi comunidad" showBack />

      {/* Detalles del barrio */}
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://ecuadors.live/wp-content/uploads/2023/07/pinas-atractivos-turisticos-de-ecuador.jpg",
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{neighborhoodDetails?.name || "Nombre no disponible"}</Text>
            <View style={styles.memberCounter}>
              <Ionicons name="people" size={16} color="#01579b" />
              <Text style={styles.memberCount}>
                {neighborhoodUsers?.length || 0}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>
            {neighborhoodDetails?.description ||
              `Comunidad organizada del sector ${neighborhoodDetails?.name || "desconocido"}, unidos por la seguridad y bienestar de todos.`}
          </Text>
        </View>
      </View>
      {/* Lista de usuarios */}
      <FlatList
        data={neighborhoodUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.member}>
              <Ionicons name="people" size={16} color="#01579b" />
              <Text style={styles.memberCount}>{item.email}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Personas que pertenecen a la comunidad
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#546e7a",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    height: 140,
    width: "100%",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#01579b",
    flex: 1,
  },
  memberCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCount: {
    marginLeft: 4,
    color: "#01579b",
    fontWeight: "500",
    fontSize: 14,
  },
  member: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  description: {
    fontSize: 14,
    color: "#546e7a",
    marginBottom: 16,
    lineHeight: 20,
  },
});

export default CommunityScreen;

