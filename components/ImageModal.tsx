import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  imageSource: ImageSourcePropType;
}

const { width, height } = Dimensions.get('window');

const ImageModal: React.FC<ImageModalProps> = ({ visible, onClose, imageSource }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={32} color="#fff" />
          </TouchableOpacity>
          
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },
});

export default ImageModal; 