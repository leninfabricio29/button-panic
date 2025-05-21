import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { usersService } from "../app/src/api/services/users-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddContactModal from "@/components/AddContactModal";
import { Ionicons } from "@expo/vector-icons";
import { contactsService } from "@/app/src/api/services/contact-service";
import { useIsFocused } from "@react-navigation/native";

interface User {
  _id: string;
  name: string;
  phone: string;
}

const PAGE_SIZE = 20;

const UsersListScreen = () => {
  const isFocused = useIsFocused();
  const [users, setUsers] = useState<User[]>([]);
  const [userContacts, setUserContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFocusedInput, setIsFocusedInput] = useState(false);

  const avatarColors = [
    "#01579b",
    "#0288d1",
    "#039be5",
    "#00acc1",
    "#00897b",
    "#43a047",
    "#7cb342",
    "#fdd835",
    "#fb8c00",
    "#f4511e",
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const allUsers = await usersService.getAllUsers();
        const loggedUserData = await AsyncStorage.getItem("user-data");
        const loggedUser = loggedUserData ? JSON.parse(loggedUserData) : null;

        const filtered = allUsers.filter(
          (user) => user._id !== loggedUser?._id
        );

        setUsers(filtered);
        setFilteredUsers(filtered);
        setVisibleUsers(filtered.slice(0, PAGE_SIZE));
        await fetchUserContacts();
      } catch (error) {
        console.error("Error cargando datos:", error);
        Alert.alert("Error", "No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Recargar contactos cuando la pantalla recibe foco
  useEffect(() => {
    if (isFocused) {
      fetchUserContacts();
    }
  }, [isFocused]);

  const fetchUserContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await contactsService.getContactsUser();
      const myContacts = res.data || [];
      setUserContacts(myContacts);
    } catch (error) {
      console.error("Error al obtener contactos:", error);
      Alert.alert("Error", "No se pudieron cargar los contactos");
    } finally {
      setLoadingContacts(false);
    }
  };

  const openAddContactModal = (userId: string) => {
    setSelectedUserId(userId);
    setModalVisible(true);
  };

  const closeAddContactModal = () => {
    setModalVisible(false);
    setSelectedUserId(null);
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.length >= 2
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const index = parseInt(id.slice(-2), 16) % avatarColors.length;
    return avatarColors[index];
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const query = text.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) || user.phone.includes(query)
    );
    setFilteredUsers(filtered);
    setVisibleUsers(filtered.slice(0, PAGE_SIZE));
    setPage(1);
  };

  const loadMore = () => {
    if (filteredUsers.length > visibleUsers.length) {
      const nextPage = page + 1;
      const nextUsers = filteredUsers.slice(0, nextPage * PAGE_SIZE);
      setVisibleUsers(nextUsers);
      setPage(nextPage);
    }
  };

  const renderAddButton = (userId: string) => {
    const isDisabled = userContacts.length >= 2;
    const contactExists = userContacts.some(
      (contact) => contact._id === userId
    );

    if (contactExists) {
      return (
        <View style={styles.contactAdded}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.addButton, isDisabled && styles.addButtonDisabled]}
        onPress={() => {
          if (isDisabled) {
            Alert.alert(
              "Límite de contactos alcanzado",
              "Ya tienes el máximo de 2 contactos permitidos. " +
                "Por favor elimina uno antes de agregar otro.",
              [{ text: "OK" }]
            );
          } else {
            openAddContactModal(userId);
          }
        }}
        disabled={isDisabled || contactExists}
      >
        <Ionicons
          name="person-add-outline"
          size={20}
          color={isDisabled || contactExists ? "#aaa" : "#01579b"}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color="#32d6a6"
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <AppHeader title="Usuarios Disponibles" />

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={24}
              color={isFocusedInput ? "#007AFF" : "#aaa"}
            />
            <TextInput
              placeholder="Buscar por nombre o teléfono"
              value={searchQuery}
              onChangeText={handleSearch}
              style={[
                styles.searchInput,
                isFocusedInput && styles.searchInputFocused,
              ]}
              placeholderTextColor="#999"
              //cursorColor="#007AFF"
              selectionColor="#007AFF20"
              //includeFontPadding={false}
              textAlignVertical="center"
              onFocus={() => setIsFocusedInput(true)}
              onBlur={() => setIsFocusedInput(false)}
            />
          </View>
          <View style={styles.limitContainer}>
            {userContacts.length >= 2 && (
              <View style={styles.limitBanner}>
                <Ionicons
                  name="warning"
                  size={18}
                  color="#FFF"
                  style={styles.limitIcon}
                />
                <Text style={styles.limitText}>
                  Has alcanzado el límite máximo de 2 contactos
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Límite de contactos",
                      "Para agregar más contactos, por favor elimina uno existente.",
                      [{ text: "Entendido" }]
                    );
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color="#FFF"
                    style={styles.infoIcon}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <FlatList
            data={visibleUsers}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.usersList}
            renderItem={({ item }) => (
              <View style={styles.userItemContainer}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: getAvatarColor(item._id) },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(item.name)}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userDetail}>{item.phone}</Text>
                </View>
                {renderAddButton(item._id)}
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyResultsText}>No hay usuarios</Text>
              </View>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />

          <AddContactModal
            visible={modalVisible}
            onClose={() => {
              closeAddContactModal();
              setSearchQuery("");
            }}
            contactUserId={selectedUserId}
            onSuccess={async () => {
              /* Alert.alert("Éxito", "Contacto actualizado correctamente"); */
              await fetchUserContacts();
              setSearchQuery("");
              setSelectedUserId(null);
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  usersList: {
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
    padding: 0,
    paddingTop: Platform.select({ android: 4, ios: 8 }),
    paddingBottom: Platform.select({ android: 4, ios: 8 }),
  },
  searchInputFocused: {
    borderColor: "#007AFF",
  },
  userItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1f5fe",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2e1f0f",
  },
  userDetail: {
    fontSize: 14,
    color: "#5c4033",
  },
  addButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#01579b",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  contactExists: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  emptyResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyResultsText: {
    color: "#8b5e3c",
    fontSize: 16,
  },
  limitContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  limitBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5252",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  limitIcon: {
    marginRight: 8,
  },
  limitText: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  infoIcon: {
    marginLeft: 8,
  },
  contactAdded: {
    padding: 8,
    marginRight: 4,
  },
});

export default UsersListScreen;
