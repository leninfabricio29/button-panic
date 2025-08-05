import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import moment from 'moment';
import { notifyService } from '../src/api/services/notification-service';
import { useAuth } from '../context/AuthContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  emitter: string;
  receiver: string;
}

const filterOptions = [
  { label: 'Todas', value: 'todas' },
  { label: 'Hoy', value: 'hoy' },
  { label: 'Esta semana', value: 'semana' },
];

const NotificationsScreen = () => {
  const { user } = useAuth();
  const userId = user._id;

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Definición de colores dinámica según el modo
  const colors = isDarkMode
    ? {
        background: '#121212',
        card: '#1e1e1e',
        surface: '#2d2d2d',
        primary: '#64b5f6',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        textMuted: '#757575',
        border: '#333333',
      }
    : {
        background: '#ffffff',
        card: '#fff',
        surface: '#f5f5f5',
        primary: '#01579b',
        text: '#333333',
        textSecondary: '#546e7a',
        textMuted: '#666666',
        border: '#ccc',
      };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('todas');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notifyService.getNotificationsByUserId(userId);
        setNotifications(data);
      } catch (error) {
        console.error('Error al obtener las notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const filteredNotifications = notifications.filter((n) => {
    const createdAt = new Date(n.createdAt);
    const now = new Date();

    if (filterType === 'hoy') {
      return (
        createdAt.getDate() === now.getDate() &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }

    if (filterType === 'semana') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return createdAt >= oneWeekAgo;
    }

    return true; // 'todas'
  });

  const renderItem = ({ item }: { item: Notification }) => {
    const isOwn = item.emitter === userId;
    const borderColor = isOwn ? '#ff6b6b' : '#32d6a6';
    const message = isOwn ? 'Has presionado el botón de pánico.' : item.message;

    return (
      <View
        style={[
          styles.notificationItem,
          {
            borderLeftColor: borderColor,
            backgroundColor: colors.card,
          },
        ]}
      >
        <MaterialIcons name="notification-important" size={24} color={borderColor} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { color: colors.primary }]}>{item.title}</Text>
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {moment(item.createdAt).fromNow()}
          </Text>
        </View>
      </View>
    );
  };

  const renderCustomChip = (
    label: string,
    value: string,
    currentValue: string,
    onPress: (val: string) => void
  ) => {
    const selected = currentValue === value;
    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.chip,
          { backgroundColor: colors.surface, borderColor: colors.border },
          selected && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={() => onPress(value)}
      >
        <Text
          style={[
            styles.chipText,
            { color: colors.text },
            selected && { color: 'white', fontWeight: 'bold' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Historial de Notificaciones" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filterOptions.map(({ label, value }) =>
          renderCustomChip(label, value, filterType, setFilterType)
        )}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textMuted }}>
              No hay notificaciones
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    padding: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default NotificationsScreen;
