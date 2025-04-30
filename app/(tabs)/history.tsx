import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import moment from 'moment';

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: Date;
  emitter: string;
  receiver: string;
}

const userId = 'user123';

const notifications: Notification[] = [
  {
    _id: '1',
    title: 'Alerta de emergencia',
    message: 'Una persona ha presionado el botón de pánico.',
    createdAt: new Date(),
    emitter: 'user456',
    receiver: 'user123',
  },
  {
    _id: '2',
    title: 'Botón presionado',
    message: 'Has activado una alerta de emergencia.',
    createdAt: new Date(),
    emitter: 'user123',
    receiver: 'user456',
  },
];

const filterOptions = [
  { label: 'Todas', value: 'todas' },
  { label: 'Recibidas', value: 'recibida' },
  { label: 'Emitidas', value: 'emitida' },
];



const NotificationsScreen = () => {
  const [filterType, setFilterType] = useState<string>('todas');
  const [filterDate, setFilterDate] = useState<string>('todas');

  const renderItem: ListRenderItem<Notification> = ({ item }) => {
    const isOwn = item.emitter === userId;
    const borderColor = isOwn ? '#ff6b6b' : '#32d6a6';
    const message = isOwn
      ? 'Has presionado el botón de pánico.'
      : item.message;

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

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,

  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
  chipSelected: {
    backgroundColor: '#01579b',
    borderColor: '#01579b',
  },
  chipText: {
    color: '#5c4033',
    fontSize: 14,
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
