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
  useColorScheme,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/es';
import { usersService } from '../app/src/api/services/users-service';
import { useAuth } from '../app/context/AuthContext';
import { mediaService } from '@/app/src/api/services/media-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

moment.locale('es');

interface UserProfile {
  _id: string;
  ci: string;
  avatar: string;
  name: string;
  phone: string;
  email: string;
  fcmToken: string;
  isActive: boolean;
  neighborhood: any;
  createdAt: string;
  updatedAt: string;
  photo_profile_url?: string;
  lastLocation?: {
    type: string;
    coordinates: number[];
    lastUpdated: string;
  };
  __v: number;
  password?: string;
}

export default function UserAccountScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { user, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<{ id: string; url: string }[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Colors for light and dark mode
  const colors = isDarkMode
    ? {
        background: '#121212',
        cardBackground: '#1E1E1E',
        border: '#333',
        textPrimary: '#FFFFFF',
        textSecondary: '#cccccc',
        inputBackground: '#2c2c2c',
        inputBorder: '#444',
        placeholder: '#999999',
        infoBackground: '#21436e',
        infoText: '#a9c4ff',
        buttonBackground: '#32d6a6',
        buttonText: '#fff',
        editIconBackground: '#32d6a6',
        highlightBorder: '#32d6a6',
        joinedIcon: '#ffb07c',
      }
    : {
        background: '#f5f5f5',
        cardBackground: '#fff',
        border: '#eeeeee',
        textPrimary: '#343a40',
        textSecondary: '#555',
        inputBackground: '#f8f9fa',
        inputBorder: '#e0e0e0',
        placeholder: '#999',
        infoBackground: '#e1f5fe',
        infoText: '#2980b9',
        buttonBackground: '#32d6a6',
        buttonText: '#fff',
        editIconBackground: '#32d6a6',
        highlightBorder: '#32d6a6',
        joinedIcon: '#ff7f50',
      };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?._id) {
          const fullUser: UserProfile = await usersService.getUserById(user._id);
          setUserProfile(fullUser);
          setPhone(fullUser.phone || '');
          setEmail(fullUser.email || '');
          setAvatar(fullUser.avatar || '');
          setSelectedAvatarUrl(fullUser.avatar);
          setHasChanges(false);
        } else {
          Alert.alert('Error', 'Usuario no autenticado.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'No se pudo cargar el perfil.');
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?._id]);

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

  useEffect(() => {
    if (userProfile) {
      const phoneChanged = phone !== (userProfile.phone || '');
      const emailChanged = email !== (userProfile.email || '');
      const avatarChanged =
        selectedAvatarUrl !== (userProfile.photo_profile_url || `https://api.dicebear.com/9.x/micah/png?seed=${userProfile._id.substring(0, 5)}`);
      setHasChanges(phoneChanged || avatarChanged || emailChanged);
    }
  }, [phone, email, selectedAvatarUrl, userProfile]);

  const handleAvatarSelect = (avatarItem: { id: string; url: string }) => {
    setSelectedAvatarUrl(avatarItem.url);
    setShowAvatarPicker(false);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handleSaveChanges = async () => {
    if (!userProfile || !hasChanges) return;

    try {
      setSaving(true);

      await usersService.updateUser(userProfile._id, {
        email,
        phone,
        avatar: selectedAvatarUrl ?? '',
      });

      const updatedUser = {
        ...user,
        email,
        phone,
        avatar: selectedAvatarUrl ?? '',
        photo_profile_url: selectedAvatarUrl ?? '',
      };

      setUser(updatedUser);
      await AsyncStorage.setItem('user-data', JSON.stringify(updatedUser));
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
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Mi Cuenta" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttonBackground} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Mi Cuenta" showBack />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e63946" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>No se pudo cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Mi Cuenta" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.infoBackground, borderLeftColor: colors.infoText }]}>
          <Ionicons name="information-circle" size={24} color={colors.infoText} />
          <Text style={[styles.infoText, { color: colors.infoText }]}>
            Solo puedes editar tu avatar, email y número de teléfono
          </Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.cardBackground, shadowColor: isDarkMode ? '#000' : '#000' }]}>
          <View style={styles.avatarContainer}>
            <Image source={selectedAvatarUrl ? { uri: selectedAvatarUrl } : null} style={styles.avatar} />

            <TouchableOpacity
              style={[styles.editIcon, { backgroundColor: colors.editIconBackground }]}
              onPress={() => setShowAvatarPicker(!showAvatarPicker)}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

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
                      selectedAvatarUrl === item.url && {
                        ...styles.avatarOptionSelected,
                        borderColor: colors.highlightBorder,
                        shadowColor: colors.highlightBorder,
                      },
                    ]}
                  />
                </TouchableOpacity>
              )}
            />
          )}

          <View style={styles.section}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Nombre</Text>
              <Text style={[styles.staticText, { color: colors.textPrimary }]}>{userProfile.name}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Cédula</Text>
              <Text style={[styles.staticText, { color: colors.textPrimary }]}>{userProfile.ci}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
              <View style={styles.editableField}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="none"
                />
                <Ionicons name="pencil" size={20} color={colors.buttonBackground} style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Teléfono</Text>
              <View style={styles.editableField}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="none"
                />
                <Ionicons name="pencil" size={20} color={colors.buttonBackground} style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Te uniste el</Text>
              <View style={styles.joinedContainer}>
                <Ionicons name="calendar" size={18} color={colors.joinedIcon} style={styles.joinedIcon} />
                <Text style={[styles.joinedText, { color: colors.textPrimary }]}>
                  {moment(userProfile.createdAt).format('DD [de] MMMM [de] YYYY')}
                </Text>
              </View>
            </View>
          </View>

          {hasChanges && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.buttonBackground }]}
              onPress={handleSaveChanges}
              disabled={saving}
            >
              {saving ? <ActivityIndicator size="small" color={colors.buttonText} /> : <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>Guardar cambios</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
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
    borderColor: '#f2f2f2',
  },
  editIcon: {
    padding: 8,
    borderRadius: 18,
    position: 'absolute',
    bottom: 0,
    right: '35%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarPicker: {
    paddingVertical: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 5,
  },
  section: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  staticText: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  editableField: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    padding: 12,
    paddingRight: 40,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  joinedIcon: {
    marginRight: 8,
  },
  joinedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
