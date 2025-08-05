import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PolicyModal({ visible, onAccept }: { visible: boolean; onAccept: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Acuerdo de políticas</Text>
          <Text style={styles.body}>
            La aplicación Viryx SOS ha sido desarrollada por Softkilla y es propiedad exclusiva de Viryx.{"\n\n"}
            Queda estrictamente prohibida cualquier reproducción, distribución, modificación o uso no autorizado del software, copias, imitaciones o ingeniería inversa.{"\n\n"}
            Este producto se encuentra protegido por las leyes de derechos de autor y propiedad intelectual vigentes.{"\n\n"}
            Al continuar, aceptas cumplir con estas condiciones.
          </Text>
          <TouchableOpacity onPress={onAccept} style={styles.button}>
            <Text style={styles.buttonText}>Aceptar y continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // fondo semi-transparente oscuro
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e1e1e', // fondo oscuro del modal
    padding: 25,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#4fc3f7', // azul claro para título
  },
  body: {
    fontSize: 14,
    color: '#cccccc', // texto claro para lectura cómoda
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#4fc3f7', // botón azul claro para buen contraste
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1e1e1e', // texto oscuro para botón claro
    fontWeight: '600',
  },
});

