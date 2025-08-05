import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

export default function TabLayout() {
  // Detectar tema del sistema
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Actualizar tema cuando cambie el sistema
  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  // Función para obtener colores según el tema
  const getThemeColors = () => {
    return isDarkMode ? {
      // Colores para modo oscuro
      tabBarBackground: '#1e1e1e',
      tabBarBorder: '#333333',
      tabBarActiveTint: '#64b5f6',
      tabBarInactiveTint: '#9e9e9e',
      tabBarIconActive: '#64b5f6',
      tabBarIconInactive: '#9e9e9e',
      shadowColor: '#000',
      shadowOpacity: 0.3,
    } : {
      // Colores para modo claro (originales)
      tabBarBackground: '#01579b',
      tabBarBorder: 'transparent',
      tabBarActiveTint: 'white',
      tabBarInactiveTint: 'rgba(255, 255, 255, 0.7)',
      tabBarIconActive: 'white',
      tabBarIconInactive: 'rgba(255, 255, 255, 0.7)',
      shadowColor: '#000',
      shadowOpacity: 0.05,
    };
  };

  const colors = getThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActiveTint,
        tabBarInactiveTintColor: colors.tabBarInactiveTint,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          height: 70,
          paddingBottom: 8,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          overflow: 'hidden', // <--- esto oculta cualquier fondo blanco fuera del borde redondeado
          borderTopWidth: isDarkMode ? 1 : 0,
          borderTopColor: colors.tabBarBorder,
          shadowColor: colors.shadowColor,
          shadowOpacity: colors.shadowOpacity,
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
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={focused ? colors.tabBarIconActive : colors.tabBarIconInactive}
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
              name={focused ? 'notifications-circle' : 'notifications-circle-outline'}
              size={size}
              color={focused ? colors.tabBarIconActive : colors.tabBarIconInactive}
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
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={focused ? colors.tabBarIconActive : colors.tabBarIconInactive}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configuraciones',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={focused ? colors.tabBarIconActive : colors.tabBarIconInactive}
            />
          ),
        }}
      />
    </Tabs>
  );
}