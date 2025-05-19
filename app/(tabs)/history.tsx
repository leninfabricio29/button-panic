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
      <View style={[styles.notificationItem, { borderLeftColor: borderColor }]}>
        <MaterialIcons name="notification-important" size={24} color={borderColor} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.time}>{moment(item.createdAt).fromNow()}</Text>
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
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={() => onPress(value)}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Historial de Notificaciones" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filterOptions.map(({ label, value }) =>
          renderCustomChip(label, value, filterType, setFilterType)
        )}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#01579b" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay notificaciones</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filters: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
 chip: {
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 16,
  backgroundColor: '#fff',
  marginRight: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  height: 32,
  justifyContent: 'center',
},
chipSelected: {
  backgroundColor: '#01579b',
  borderColor: '#01579b',
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  elevation: 4,
},
chipText: {
  color: '#5c4033',
  fontSize: 14,
  textAlign: 'center',
},
chipTextSelected: {
  color: 'white',
  fontWeight: 'bold',
},

  list: {
    padding: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 5,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2980b9',
  },
  message: {
    color: '#5c4033',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#8b5e3c',
    marginTop: 4,
  },
});

export default NotificationsScreen;
