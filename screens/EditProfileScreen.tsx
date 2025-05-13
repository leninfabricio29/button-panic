// app/screens/UserAccountScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/es'; // Import Spanish locale for moment
import { usersService } from '../app/src/api/services/users-service'; // Assuming this service exists
import { useAuth } from '../app/context/AuthContext'; // Assuming this context exists
import { mediaService } from '@/app/src/api/services/media-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

moment.locale('es'); // Set locale to Spanish

// Define a type for the user profile data based on the provided structure
interface UserProfile {
  _id: string;
  ci: string;
  avatar: string,
  name: string;
  phone: string;
  email: string;
  fcmToken: string;
  isActive: boolean;
  neighborhood: any;
  createdAt: string; // Needed for "Te uniste el"
  updatedAt: string;
  photo_profile_url?: string; // Optional, from the first data structure
  lastLocation?: {
    type: string;
    coordinates: number[];
    lastUpdated: string;
  };
  __v: number;
  password?: string;
}

export default function UserAccountScreen() {
  const { user, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false); // Use boolean for picker visibility
  // Definir avatarOptions aquí, no afuera del componente
  const [avatarOptions, setAvatarOptions] = useState<{ id: string; url: string }[]>([]);

  // State to track if changes have been made
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?._id) {
          const fullUser: UserProfile = await usersService.getUserById(user._id);
          setUserProfile(fullUser);
          setPhone(fullUser.phone || '');
          setEmail(fullUser.email || '')
          setAvatar(fullUser.avatar || '')
          // Use the fetched photo_profile_url, or a default DiceBear based on a hash or user ID if available/needed
          setSelectedAvatarUrl(fullUser.avatar)
          // Reset hasChanges after initial load
          setHasChanges(false);
        } else {
             // Handle case where user is not available (e.g., not logged in)
            Alert.alert('Error', 'Usuario no autenticado.');
            // Optionally redirect to login
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert('Error', 'No se pudo cargar el perfil.');
        setUserProfile(null); // Set to null to show error state
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?._id]); // Depend on user._id

  useEffect(() => {
    const fetchPackagesAvatar = async () => {
      try {
        const packages = await mediaService.getPackagesAvatar();
        const options = packages
          .filter((pkg: any) => pkg.type === 'avatar' && pkg.status === true)
          .flatMap((pkg: any) =>
            pkg.images.map((img: any) => ({
              id: img._id,
              url: img.url,
            }))
          );
        setAvatarOptions(options);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudieron cargar los avatares');
      }
    };
    fetchPackagesAvatar();
  }, []);


  // Effect to track changes
  useEffect(() => {
    if (userProfile) {
      const phoneChanged = phone !== (userProfile.phone || '');
      const emailChanged = email !== (userProfile.email || '');
      const avatarChanged = selectedAvatarUrl !== (userProfile.photo_profile_url || `https://api.dicebear.com/9.x/micah/png?seed=${userProfile._id.substring(0, 5)}`); // Compare with initial loaded avatar URL
      setHasChanges(phoneChanged || avatarChanged || emailChanged);
    }
  }, [phone, email, selectedAvatarUrl, userProfile]);

  const handleAvatarSelect = (avatarItem: { id: string; url: string }) => {
    setSelectedAvatarUrl(avatarItem.url);
    setShowAvatarPicker(false); // Hide the picker after selection
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

   // asegúrate de importar useAuth




const handleSaveChanges = async () => {
  if (!userProfile || !hasChanges) return;

  try {
    setSaving(true);

    await usersService.updateUser(userProfile._id, {
      email,
      phone,
      avatar: selectedAvatarUrl ?? '',
    });

    // 🔄 Datos actualizados del usuario
    const updatedUser = {
      ...user,
      email,
      phone,
      avatar: selectedAvatarUrl ?? '',
      photo_profile_url: selectedAvatarUrl ?? '',
    };

    // ✅ Actualiza el contexto global
    setUser(updatedUser);

    // ✅ Persiste en AsyncStorage
    await AsyncStorage.setItem('user-data', JSON.stringify(updatedUser));

    // ✅ Actualiza el estado local también (opcional si ya usas updatedUser en la UI)
    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            email,
            phone,
            avatar: selectedAvatarUrl ?? '',
            photo_profile_url: selectedAvatarUrl ?? '',
          }
        : null
    );

    setHasChanges(false);
    Alert.alert('Éxito', 'Perfil actualizado correctamente.');
  } catch (error) {
    console.error("Error saving profile:", error);
    Alert.alert('Error', 'No se pudieron guardar los cambios.');
  } finally {
    setSaving(false);
  }
};



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Mi Cuenta" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#32d6a6" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Mi Cuenta" showBack />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e63946" />
          <Text style={styles.loadingText}>No se pudo cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Mi Cuenta" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mensaje de advertencia */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <Text style={styles.infoText}>Solo puedes editar tu avatar, email y número de teléfono</Text>
        </View>

        <View style={styles.profileCard}>
          {/* Avatar section with edit icon */}
          <View style={styles.avatarContainer}>
            <Image
  source={selectedAvatarUrl ? { uri: selectedAvatarUrl } : null}
  style={styles.avatar}
/>

            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => setShowAvatarPicker(!showAvatarPicker)} // Toggle picker visibility
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Horizontal Avatar Picker */}
          {showAvatarPicker && (
            <FlatList
              data={avatarOptions}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarPicker}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
                  <Image
                    source={{ uri: item.url }}
                    style={[
                      styles.avatarOption,
                      selectedAvatarUrl === item.url && styles.avatarOptionSelected,
                    ]}
                  />
                </TouchableOpacity>
              )}
            />
          )}

          {/* Profile Data Section */}
          <View style={styles.section}>
            {/* Name (Read-only) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.staticText}>{userProfile.name}</Text>
            </View>

            {/* CI (Read-only) */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Cédula</Text>
                <Text style={styles.staticText}>{userProfile.ci}</Text>
            </View>

            {/* Email (Editable) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.editableField}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
                {/* Edit icon inside input field (for styling purposes) */}
                <Ionicons name="pencil" size={20} color="#32d6a6" style={styles.inputIcon} />
              </View>
            </View>

            {/* Phone (Editable) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.editableField}>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
                {/* Edit icon inside input field (for styling purposes) */}
                <Ionicons name="pencil" size={20} color="#32d6a6" style={styles.inputIcon} />
              </View>
            </View>

            {/* Joined Date (Read-only) */}
             <View style={styles.fieldContainer}>
                <Text style={styles.label}>Te uniste el</Text>
                <View style={styles.joinedContainer}>
                    <Ionicons name="calendar" size={18} color="#ff7f50" style={styles.joinedIcon} />
                    <Text style={styles.joinedText}>
                        {moment(userProfile.createdAt).format('DD [de] MMMM [de] YYYY')}
                    </Text>
                </View>
            </View>
          </View>

          {/* Save Changes Button - Visible only when changes are made */}
          {hasChanges && (
              <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveChanges}
                  disabled={saving} // Disable while saving
              >
                  {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                  ) : (
                      <Text style={styles.saveButtonText}>Guardar cambios</Text>
                  )}
              </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Saving Overlay */}
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light grey background
  },
  content: {
    padding: 16,
    paddingBottom: 40, // Add padding at the bottom
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#555',
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#e1f5fe', // Light blue background
    //backgroundColor: '#fcff7d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20, // Increased margin
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db', // Blue border
    //borderLeftColor: '#f9ff0e'
  },
  infoText: {
    marginLeft: 10,
    color: '#2980b9', // Darker blue text
    flex: 1,
    fontSize: 14,
    lineHeight: 20, // Improved readability
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased shadow offset
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Android Shadow
    elevation: 8, // Increased elevation
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#f2f2f2', // Light border
  },
  editIcon: {
    backgroundColor: '#32d6a6', // Teal green
    padding: 8,
    borderRadius: 18, // Slightly larger for better touch
    position: 'absolute',
    bottom: 0, // Position relative to the avatar bottom
    right: '35%', // Adjust position to be on the avatar
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // Android Shadow
    elevation: 3,
  },
  avatarPicker: {
    paddingVertical: 12,
    marginBottom: 20, // Space below the picker
    justifyContent: 'center',
    alignItems: 'center', // Center the items in the list
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 6, // Horizontal margin
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: '#32d6a6', // Highlight color
    borderWidth: 3, // Thicker border for selection
    // iOS Shadow
    shadowColor: '#32d6a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, // Stronger shadow
    shadowRadius: 6, // Larger shadow
    // Android Shadow
    elevation: 5,
  },
  section: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 18, // Space between fields
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#01579b', // Greyish color
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  staticText: {
    fontSize: 16,
    color: '#343a40', // Dark text
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee', // Light grey separator
  },
  editableField: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', // Needed for absolute positioning of icon
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Very light grey background
    padding: 12,
    paddingRight: 40, // Make space for the icon
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light grey border
    fontSize: 16,
    color: '#343a40',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    // Center vertically
    top: '50%',
    transform: [{ translateY: -10 }], // Adjust translateY based on icon size/2
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  joinedIcon: {
    marginRight: 8,
  },
  joinedText: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500', // Medium weight
  },
  saveButton: {
    backgroundColor: '#32d6a6', // Teal green
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 25, // More space above the button
    // iOS Shadow
    shadowColor: '#32d6a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, // Stronger shadow
    shadowRadius: 6, // Larger radius
    // Android Shadow
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17, // Slightly larger font
    fontWeight: 'bold',
  },
   logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e63946', // Red color for danger
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Space above
    // Optional: Add subtle shadow
     shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's on top
  },
});