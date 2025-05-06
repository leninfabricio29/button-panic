import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  FlatList,
  Alert,
} from "react-native";
import { contactsService } from "@/app/src/api/services/contact-service";
import { Ionicons } from "@expo/vector-icons";

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  contactUserId: string;
  onSuccess: () => void;
  currentContactsCount: number;
}

export default function AddContactModal({
  visible,
  onClose,
  contactUserId,
  onSuccess,
}: AddContactModalProps) {
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const relationshipOptions = [
    { label: "Seleccione relación", value: "" },
    { label: "Padre", value: "padre" },
    { label: "Madre", value: "madre" },
    { label: "Hermano/a", value: "hermano/a" },
    { label: "Primo/a", value: "primo/a" },
    { label: "Amigo/a", value: "amigo/a" },
    { label: "Pareja", value: "pareja" },
  ];

  const validateFields = () => {
    if (!alias.trim()) {
      Alert.alert(
        "Campo requerido",
        "Por favor ingresa un alias para el contacto"
      );
      return false;
    }

    if (!selectedRelationship) {
      Alert.alert("Campo requerido", "Por favor selecciona una relación");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      await contactsService.addContact({
        alias,
        relationship: selectedRelationship,
        contactUser: contactUserId,
      });
      alert("Contacto añadido con éxito");
      onSuccess();
      // Limpiar los campos después de un envío exitoso
      setAlias("");
      setSelectedRelationship("");
      handleClose();
    } catch (error) {
      console.error("Error registrando contacto:", error);
      alert("Hubo un error, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Limpiar los campos cuando se cierre el modal
    setAlias("");
    setSelectedRelationship("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Añadir contacto</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#777"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Nombre de alias"
                  placeholderTextColor="#999"
                  value={alias}
                  onChangeText={setAlias}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowDropdown(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#777"
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.input,
                    { color: selectedRelationship ? "#333" : "#999" },
                  ]}
                >
                  {relationshipOptions.find(
                    (option) => option.value === selectedRelationship
                  )?.label || "Seleccione relación"}
                </Text>
                <Ionicons
                  name={
                    showDropdown ? "chevron-up-outline" : "chevron-down-outline"
                  }
                  size={20}
                  color="#777"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              <Modal
                visible={showDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownOverlay}
                  activeOpacity={1}
                  onPress={() => setShowDropdown(false)}
                >
                  <View style={styles.dropdownContainer}>
                    <FlatList
                      data={relationshipOptions}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownOption}
                          onPress={() => {
                            setSelectedRelationship(item.value);
                            setShowDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => (
                        <View style={styles.dropdownSeparator} />
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#32d6a6"
                  style={styles.loader}
                />
              ) : (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Guardar contacto</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleClose}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
    color: "#2d3436",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 10,
    color: "#01579b",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
    fontSize: 16,
    paddingRight: 30, // Espacio para el ícono
  },
  dropdownButton: {
    position: "absolute",
    right: 10,
    top: 15,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    width: "80%",
    maxHeight: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 10,
  },
  buttonsContainer: {
    marginTop: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#32d6a6",
    shadowColor: "#32d6a6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#636e72",
  },
  loader: {
    marginVertical: 30,
  },
});
