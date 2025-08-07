import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/components/AppHeader";
import { entityService } from "../app/src/api/services/entity-service";
import { usersService } from "../app/src/api/services/users-service";
import { useAuth } from "../app/context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

type EntityType =
  | "police"
  | "ambulance"
  | "fire"
  | "security_private"
  | "other";

type Entity = {
  _id: string;
  name: string;
  address?: string;
  type: EntityType;
  users_suscribed: string[];
};

type FilterOption = {
  type: EntityType | "all";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const SecureZone = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<EntityType | "all">(
    "all"
  );
  const [loadingEntityId, setLoadingEntityId] = useState<string | null>(null);

  const { user } = useAuth()
 
useEffect(() => {
  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user-data');
      if (stored) {
        const user2 = JSON.parse(stored);
        console.log('Usuario:', user2);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  loadUser();
}, []);


 


  const filterOptions: FilterOption[] = [
    { type: "all", label: "Todas", icon: "apps-outline", color: "#6B7280" },
    {
      type: "police",
      label: "Policía",
      icon: "shield-outline",
      color: "#3B82F6",
    },
    {
      type: "ambulance",
      label: "Ambulancia",
      icon: "medical-outline",
      color: "#EF4444",
    },
    {
      type: "fire",
      label: "Bomberos",
      icon: "flame-outline",
      color: "#F97316",
    },
    {
      type: "security_private",
      label: "Seguridad",
      icon: "lock-closed-outline",
      color: "#8B5CF6",
    },
    {
      type: "other",
      label: "Otros",
      icon: "ellipsis-horizontal-outline",
      color: "#6B7280",
    },
  ];

  const getEntityIcon = (type: EntityType): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<EntityType, keyof typeof Ionicons.glyphMap> = {
      police: "shield-outline",
      ambulance: "medical-outline",
      fire: "flame-outline",
      security_private: "lock-closed-outline",
      other: "business-outline",
    };
    return iconMap[type];
  };

  const getEntityColor = (type: EntityType): string => {
    const colorMap: Record<EntityType, string> = {
      police: "#3B82F6",
      ambulance: "#EF4444",
      fire: "#F97316",
      security_private: "#8B5CF6",
      other: "#6B7280",
    };
    return colorMap[type];
  };

  useEffect(() => {
    if (user) {
      fetchEntities();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFilter === "all") {
      setFilteredEntities(entities);
    } else {
      setFilteredEntities(
        entities.filter((entity) => entity.type === selectedFilter)
      );
    }
  }, [entities, selectedFilter]);

  const fetchEntities = async () => {
    try {
      const response = await entityService.getAllEntity();
      setEntities(response.data);
    } catch (error) {
      console.error("Error al obtener entidades:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeToggle = async (
    entityId: string,
    isSubscribed: boolean
  ) => {
    setLoadingEntityId(entityId);
    try {
      if (!isSubscribed) {
        const response = await usersService.suscribeEntity({
          entityId,
          userId: user._id,
        });
        Alert.alert("Petición enviada ✅",
          "El administrador de la entidad validará tu ingreso"
        )

        console.log(response)
      } else {
        await usersService.unsuscribeEntity({ entityId, userId: user._id });
      }

      fetchEntities();
    } catch (error: any) {
      console.error("❌ Error al cambiar suscripción:", error);
        console.log("User 1",user)


      // Si es AxiosError y viene con status 403
      if (
        error.response?.status === 403 &&
        error.response.data?.message === "Límite de suscripciones alcanzado."
      ) {
        Alert.alert(
          "Límite alcanzado",
          `Solo puedes suscribirte a ${user.max_limit_suscribed} zonas o grupos de seguridad.`,
          [{ text: "Entendido", style: "cancel" }]
        );
      } else {
        Alert.alert("Error", "No se pudo completar la operación.", [
          { text: "OK", style: "default" },
        ]);
      }
    } finally {
      setLoadingEntityId(null);
    }
  };

  const renderFilterButton = ({ item }: { item: FilterOption }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor:
            selectedFilter === item.type ? item.color : "#F3F4F6",
          borderColor: selectedFilter === item.type ? item.color : "#E5E7EB",
        },
      ]}
      onPress={() => setSelectedFilter(item.type)}
    >
      <Ionicons
        name={item.icon}
        size={16}
        color={selectedFilter === item.type ? "#FFFFFF" : item.color}
      />
      <Text
        style={[
          styles.filterButtonText,
          { color: selectedFilter === item.type ? "#FFFFFF" : item.color },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Entity }) => {
    const isSubscribed = item.users_suscribed.includes(user._id);
    const entityColor = getEntityColor(item.type);
    const entityIcon = getEntityIcon(item.type);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.entityInfo}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: entityColor + "20" },
              ]}
            >
              <Ionicons name={entityIcon} size={24} color={entityColor} />
            </View>
            <View style={styles.textInfo}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.type}>
                {filterOptions.find((f) => f.type === item.type)?.label ||
                  item.type}
              </Text>
              {item.address && (
                <View style={styles.addressContainer}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.address}>{item.address}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.subscribersInfo}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.subscribersCount}>
              {item.users_suscribed.length}
            </Text>
          </View>
        </View>

       <TouchableOpacity
  style={[
    styles.button,
    {
      backgroundColor: isSubscribed ? '#FEE2E2' : '#DBEAFE',
      borderColor: isSubscribed ? '#EF4444' : '#3B82F6',
      opacity: loadingEntityId === item._id ? 0.6 : 1,
    }
  ]}
  onPress={() => handleSubscribeToggle(item._id, isSubscribed)}
  disabled={loadingEntityId === item._id}
>
  {loadingEntityId === item._id ? (
    <Text style={[styles.buttonText, { color: '#6B7280' }]}>Procesando...</Text>
  ) : (
    <>
      <Ionicons
        name={isSubscribed ? 'exit-outline' : 'add-circle-outline'}
        size={18}
        color={isSubscribed ? '#EF4444' : '#3B82F6'}
      />
      <Text
        style={[
          styles.buttonText,
          { color: isSubscribed ? '#EF4444' : '#3B82F6' }
        ]}
      >
        {isSubscribed ? 'Salir de zona' : 'Suscribirse'}
      </Text>
    </>
  )}
</TouchableOpacity>

      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Zonas Seguras" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando zonas seguras...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Zonas Seguras" showBack />

      {/* Header informativo */}
      <View style={styles.headerInfo}>
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#3B82F6"
          />
          <Text style={styles.infoText}>
            Suscríbete a las zonas seguras para recibir notificaciones y
            actualizaciones importantes de emergencia en tu área.
          </Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtrar por tipo:</Text>
        <FlatList
          data={filterOptions}
          keyExtractor={(item) => item.type}
          renderItem={renderFilterButton}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Lista de entidades */}
      <FlatList
        data={filteredEntities}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No hay zonas disponibles</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === "all"
                ? "No se encontraron zonas seguras registradas."
                : "No hay zonas del tipo seleccionado."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default SecureZone;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  headerInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoCard: {
    backgroundColor: "#EBF8FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  filtersContent: {
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  entityInfo: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textInfo: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  type: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  subscribersInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscribersCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
