import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';

const faqs = [
  {
    question: '¿Cómo uso el botón de pánico?',
    answer: 'Simplemente presiona el botón rojo en la pantalla principal en caso de emergencia.',
  },
  {
    question: '¿Puedo tener más de dos contactos?',
    answer: 'No, por ahora solo puedes registrar hasta 2 contactos de emergencia.',
  },
  {
    question: '¿Cómo pertenezco a un barrio?',
    answer: 'Ve a la sección "Barrios/Grupos" y presiona el botón "Unirme" en el barrio que deseas.',
  },
];

export default function FAQScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Preguntas Frecuentes" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {faqs.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <View style={styles.faqHeader}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={isDark ? '#63b3ed' : '#2980b9'}
                style={styles.icon}
              />
              <Text style={styles.question}>{item.question}</Text>
            </View>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a202c' : '#fff', // gris muy oscuro o blanco
    },
    content: {
      padding: 20,
    },
    faqItem: {
      marginBottom: 20,
      padding: 16,
      backgroundColor: isDark ? '#2d3748' : '#fff', // fondo oscuro o blanco
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#4a5568' : '#e1f5fe', // borde más suave en oscuro
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.6 : 0.2,
      shadowRadius: 4,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      marginRight: 8,
    },
    question: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#63b3ed' : '#2980b9', // azul claro o azul normal
    },
    answer: {
      fontSize: 14,
      color: isDark ? '#cbd5e0' : '#5c4033', // texto claro o marrón
      lineHeight: 20,
    },
  });
