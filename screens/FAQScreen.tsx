// app/screens/FAQScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Preguntas Frecuentes" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {faqs.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle-outline" size={22} color="#2980b9" style={styles.icon} />
              <Text style={styles.question}>{item.question}</Text>
            </View>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1f5fe',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
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
    color: '#2980b9',
  },
  answer: {
    fontSize: 14,
    color: '#5c4033',
    lineHeight: 20,
  },
});
