// app/screens/UsersListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { usersService } from '../app/src/api/services/users-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddContactModal from '@/components/AddContactModal'; // Ajusta la ruta si es necesario

interface User {
  _id: string;
  name: string;
  phone: string;
}

const PAGE_SIZE = 20; // 👈 20 usuarios por página

const UsersListScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
const [modalVisible, setModalVisible] = useState(false);

const openAddContactModal = (userId: string) => {
  setSelectedUserId(userId);
  setModalVisible(true);
};

const closeAddContactModal = () => {
  setModalVisible(false);
  setSelectedUserId(null);
};  

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await usersService.getAllUsers();
  
        const loggedUserData = await AsyncStorage.getItem('user-data');
        const loggedUser = loggedUserData ? JSON.parse(loggedUserData) : null;
        
        // 🔥 Filtramos usuarios, excluyendo el logueado
        const filtered = allUsers.filter(
          (user ) => user._id !== loggedUser?._id
        );
  
        setUsers(filtered);
        setFilteredUsers(filtered);
        setVisibleUsers(filtered.slice(0, PAGE_SIZE));
      } catch (error) {
        console.error('Error cargando usuarios', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);
  

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const query = text.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.phone.includes(query)
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
        <ActivityIndicator size="large" color="#32d6a6" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.container}>
            <AppHeader title="Usuarios Disponibles" />

            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Buscar por nombre o teléfono"
                value={searchQuery}
                onChangeText={handleSearch}
                style={styles.searchInput}
                placeholderTextColor="#aaa"
              />
            </View>

            <FlatList
              data={visibleUsers}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.usersList}
              renderItem={({ item }) => (
                <View style={styles.userItemContainer}>
                  <View style={[styles.avatar, { backgroundColor: '#ff6b6b' }]}>
                    <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userDetail}>{item.phone}</Text>
                  </View>
                  <TouchableOpacity 
  style={styles.addButton}
  onPress={() => openAddContactModal(item._id)}
>
  <Text style={styles.addButtonLabel}>Agregar</Text>
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
    // Opcional: refrescar usuarios, resetear, etc
    console.log('Contacto añadido correctamente');
  }}/>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf0',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  usersList: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    margin: 16,
    backgroundColor: '#fdf5e6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 16,
    color: '#2e1f0f',
  },
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf5e6',
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2e1f0f',
  },
  userDetail: {
    fontSize: 14,
    color: '#5c4033',
  },
  addButton: {
    backgroundColor: '#32d6a6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyResultsText: {
    color: '#8b5e3c',
    fontSize: 16,
  },
});

export default UsersListScreen;