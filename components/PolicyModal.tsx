import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PolicyModal({ visible, onAccept }: { visible: boolean; onAccept: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Acuerdo de políticas</Text>
          <Text style={styles.body}>
            La aplicación SafeGuard ha sido desarrollada por Softkilla y es propiedad exclusiva de Viored.{"\n\n"}
            Queda estrictamente prohibida cualquier reproducción, distribución, modificación o uso no autorizado del software, incluyendo pero no limitado a copias, imitaciones o ingeniería inversa.{"\n\n"}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#01579b',
  },
  body: {
    fontSize: 14,
    color: '#37474f',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#01579b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  }
});
