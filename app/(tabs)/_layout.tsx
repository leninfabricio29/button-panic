import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor:'#01579b',
          height: 70,
          paddingBottom: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
            name={ 'home-outline'}
            size={size}
            color='white'
          />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={'notifications-circle-outline'}
              size={size}
              color='white'
            />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
            name={ 'search-outline'}
            size={size}
            color='white'
          />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configu.',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={ 'settings-outline'}
              size={size}
              color='white'
            />
          ),
        }}
      />
    </Tabs>
  );
}
