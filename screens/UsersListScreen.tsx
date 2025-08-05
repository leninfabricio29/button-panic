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
  TextInput,
  ActivityIndicator,
  Alert,
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Colores dinámicos para modo claro/oscuro
  const colors = isDarkMode
    ? {
        background: "#121212",
        card: "#1E1E1E",
        text: "#FFF",
        textSecondary: "#B0B0B0",
        placeholder: "#999",
        border: "#333",
        iconActive: "#64B5F6",
        iconInactive: "#666",
        addButtonBackground: "#2A2A2A",
        addButtonBorder: "#64B5F6",
        addButtonDisabledBorder: "#555",
        addButtonDisabledBackground: "#333",
        limitBannerBackground: "#FF5252",
        limitBannerText: "#FFF",
      }
    : {
        background: "#FFF",
        card: "#FFF",
        text: "#2E1F0F",
        textSecondary: "#5C4033",
        placeholder: "#999",
        border: "#EEE",
        iconActive: "#007AFF",
        iconInactive: "#AAA",
        addButtonBackground: "#FFF",
        addButtonBorder: "#01579B",
        addButtonDisabledBorder: "#EEE",
        addButtonDisabledBackground: "#F9F9F9",
        limitBannerBackground: "#FF5252",
        limitBannerText: "#FFF",
      };

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

  useEffect(() => {
    fetchInitialData();
  }, []);

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
        style={[
          styles.addButton,
          {
            backgroundColor: colors.addButtonBackground,
            borderColor: colors.addButtonBorder,
          },
          isDisabled && {
            borderColor: colors.addButtonDisabledBorder,
            backgroundColor: colors.addButtonDisabledBackground,
          },
        ]}
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
          color={
            isDisabled || contactExists ? colors.iconInactive : colors.iconActive
          }
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.iconActive}
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <AppHeader title="Usuarios Disponibles" />

          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="search"
                size={24}
                color={isFocusedInput ? colors.iconActive : colors.iconInactive}
              />
              <TextInput
                placeholder="Buscar por nombre o teléfono"
                value={searchQuery}
                onChangeText={handleSearch}
                style={[
                  styles.searchInput,
                  { color: colors.text },
                  isFocusedInput && { borderColor: colors.iconActive },
                ]}
                placeholderTextColor={colors.placeholder}
                selectionColor={colors.iconActive + "20"}
                onFocus={() => setIsFocusedInput(true)}
                onBlur={() => setIsFocusedInput(false)}
              />
            </View>

            <TouchableOpacity
              style={[styles.reloadButton, { backgroundColor: colors.card }]}
              onPress={fetchInitialData}
            >
              <Ionicons name="refresh" size={20} color="blue" />
            </TouchableOpacity>
          </View>

          <View style={styles.limitContainer}>
            {userContacts.length >= 2 && (
              <View
                style={[
                  styles.limitBanner,
                  { backgroundColor: colors.limitBannerBackground },
                ]}
              >
                <Ionicons
                  name="warning"
                  size={18}
                  color={colors.limitBannerText}
                  style={styles.limitIcon}
                />
                <Text
                  style={[styles.limitText, { color: colors.limitBannerText }]}
                >
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
                    color={colors.limitBannerText}
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
              <View
                style={[
                  styles.userItemContainer,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: getAvatarColor(item._id) },
                  ]}
                >
                  <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.userDetail, { color: colors.textSecondary }]}>
                    {item.phone}
                  </Text>
                </View>
                {renderAddButton(item._id)}
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyResults}>
                <Text style={[styles.emptyResultsText, { color: colors.textSecondary }]}>
                  No hay usuarios
                </Text>
              </View>
            )}
            ListFooterComponent={() =>
              filteredUsers.length > visibleUsers.length ? (
                <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                  <Text style={styles.loadMoreText}>Cargar más</Text>
                </TouchableOpacity>
              ) : null
            }
          />

          <AddContactModal
            visible={modalVisible}
            onClose={() => {
              closeAddContactModal();
              setSearchQuery("");
            }}
            contactUserId={selectedUserId ?? ""}
            onSuccess={async () => {
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
  },
  container: {
    flex: 1,
  },
  usersList: {
    paddingBottom: 32,
  },
  searchInputFocused: {
    borderColor: "#007AFF",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 0,
    height: "100%",
  },
  userItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
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
  },
  userDetail: {
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {},
  contactAdded: {
    padding: 8,
    marginRight: 4,
  },
  emptyResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyResultsText: {
    fontSize: 16,
  },
  limitContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  limitBanner: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 14,
    fontWeight: "500",
  },
  infoIcon: {
    marginLeft: 8,
  },
  reloadButton: {
    marginLeft: 10,
    borderRadius: 10,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#01579b",
    fontWeight: "bold",
  },
});

export default UsersListScreen;
