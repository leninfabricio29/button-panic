// app/screens/UsersListScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { usersService } from "../app/src/api/services/users-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddContactModal from "@/components/AddContactModal"; // Ajusta la ruta si es necesario
import { Ionicons } from "@expo/vector-icons";
import { contactsService } from "@/app/src/api/services/contact-service";

interface User {
  _id: string;
  name: string;
  phone: string;
}

const PAGE_SIZE = 20; // 👈 20 usuarios por página

const UsersListScreen = () => {
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

  const [isFocused, setIsFocused] = useState(false);
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

  const dismissKeyboard = () => Keyboard.dismiss();

  // Función para seleccionar color basado en el índice o ID
  const getAvatarColor = (id) => {
    // Puedes usar el índice o hash del ID para seleccionar el color
    const index = parseInt(id.slice(-2), 16) % avatarColors.length; // Convierte los últimos 2 caracteres del ID a número
    return avatarColors[index];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await usersService.getAllUsers();

        const loggedUserData = await AsyncStorage.getItem("user-data");
        const loggedUser = loggedUserData ? JSON.parse(loggedUserData) : null;

        // 🔥 Filtramos usuarios, excluyendo el logueado
        const filtered = allUsers.filter(
          (user) => user._id !== loggedUser?._id
        );

        setUserContacts(userContacts);

        setUsers(filtered);
        setFilteredUsers(filtered);
        setVisibleUsers(filtered.slice(0, PAGE_SIZE));
      } catch (error) {
        console.error("Error cargando usuarios", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchUserContacts = async () => {
    try {
      const res = await contactsService.getContactsUser();
      const myContacts = res.data || [];
      setUserContacts(myContacts);
    } catch (error) {
      console.error("Error al obtener contactos:", error);
    } finally {
      setLoadingContacts(false);
    }
  };
  
  useEffect(() => {
    fetchUserContacts();
  }, []);
  
  

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
        {/* <TouchableWithoutFeedback onPress={dismissKeyboard}> */}
        <View style={styles.container}>
          <AppHeader title="Usuarios Disponibles" />

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={isFocused ? "#007AFF" : "#aaa"}
            />
            <TextInput
              placeholder="Buscar..."
              value={searchQuery}
              onChangeText={handleSearch}
              style={[
                styles.searchInput,
                isFocused && styles.searchInputFocused,
              ]}
              placeholderTextColor="#999"
              cursorColor="#007AFF"
              selectionColor="#007AFF20"
              // Añade estos props para Android:
              includeFontPadding={false} // 🔥 Elimina padding extra en Android
              textAlignVertical="center" // 🔥 Alinea verticalmente
            />
          </View>

          <FlatList
            data={visibleUsers}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.usersList}
            renderItem={({ item, index }) => (
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
                <TouchableOpacity
                  style={[
                  styles.addButton,
                  userContacts.length >= 2 && { opacity: 0.3 },
                  ]}
                  onPress={() => {
                  if (userContacts.length < 2) openAddContactModal(item._id);
                  }}
                  disabled={userContacts.length >= 2}
                >
                  <Ionicons
                  name="person-add-outline"
                  size={20}
                  color="#01579b"
                  />
                </TouchableOpacity>
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
            onClose={closeAddContactModal}
            contactUserId={selectedUserId} // 👈 aquí
            onSuccess={() => {
              console.log("Contacto añadido correctamente");
              fetchUserContacts(); // 👈 Vuelve a traer los contactos
            }}
            
          />
        </View>
        {/* </TouchableWithoutFeedback> */}
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
    /*  paddingTop: 16, */
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
    padding: 0, // 🔥 Elimina padding interno
    paddingTop: Platform.select({ android: 4, ios: 8 }), // 🔥 Ajuste específico
    paddingBottom: Platform.select({ android: 4, ios: 8 }),
  },
  searchInputFocused: {
    borderColor: "#007AFF", // Color azul cuando está enfocado
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
    //backgroundColor: '#01579b'
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
    borderRadius: 999, // completamente redondeado como un pill
    borderWidth: 2,
    borderColor: "#01579b",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
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
});

export default UsersListScreen;
