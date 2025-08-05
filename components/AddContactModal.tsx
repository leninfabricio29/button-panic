import React, { useState } from "react";
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
  useColorScheme,
} from "react-native";
import { contactsService } from "@/app/src/api/services/contact-service";
import { Ionicons } from "@expo/vector-icons";

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  contactUserId: string;
  onSuccess: () => void;
  currentContactsCount?: number; // opcional, no lo usas en el código
}

export default function AddContactModal({
  visible,
  onClose,
  contactUserId,
  onSuccess,
}: AddContactModalProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Colores para claro y oscuro
  const colors = isDarkMode
    ? {
        backgroundOverlay: "rgba(0,0,0,0.6)",
        modalBackground: "#1E1E1E",
        textPrimary: "#FFF",
        textSecondary: "#CCC",
        placeholder: "#999",
        border: "#333",
        icon: "#64B5F6",
        buttonSaveBg: "#32d6a6",
        buttonSaveShadow: "#32d6a6",
        buttonCancelBorder: "#555",
        buttonCancelText: "#AAA",
        inputBackground: "#2A2A2A",
        dropdownBackground: "#2A2A2A",
        dropdownText: "#EEE",
        dropdownSeparator: "#444",
      }
    : {
        backgroundOverlay: "rgba(0,0,0,0.6)",
        modalBackground: "#fff",
        textPrimary: "#2d3436",
        textSecondary: "#333",
        placeholder: "#999",
        border: "#dfe6e9",
        icon: "#01579b",
        buttonSaveBg: "#32d6a6",
        buttonSaveShadow: "#32d6a6",
        buttonCancelBorder: "#dfe6e9",
        buttonCancelText: "#636e72",
        inputBackground: "#f8f9fa",
        dropdownBackground: "#fff",
        dropdownText: "#333",
        dropdownSeparator: "#f0f0f0",
      };

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
    setAlias("");
    setSelectedRelationship("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.backgroundOverlay },
          ]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.modalBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Añadir contacto
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: colors.inputBackground, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Nombre de alias"
                  placeholderTextColor={colors.placeholder}
                  value={alias}
                  onChangeText={setAlias}
                  style={[styles.input, { color: colors.textSecondary }]}
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  { backgroundColor: colors.inputBackground, borderColor: colors.border },
                  { flexDirection: "row", alignItems: "center" },
                ]}
                onPress={() => setShowDropdown(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.input,
                    { color: selectedRelationship ? colors.textSecondary : colors.placeholder },
                    { paddingRight: 0, marginLeft: 0 },
                  ]}
                >
                  {relationshipOptions.find(
                    (option) => option.value === selectedRelationship
                  )?.label || "Seleccione relación"}
                </Text>
                <Ionicons
                  name={showDropdown ? "chevron-up-outline" : "chevron-down-outline"}
                  size={20}
                  color={colors.icon}
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
                  <View
                    style={[
                      styles.dropdownContainer,
                      { backgroundColor: colors.dropdownBackground },
                    ]}
                  >
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
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              { color: colors.dropdownText },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => (
                        <View
                          style={[
                            styles.dropdownSeparator,
                            { backgroundColor: colors.dropdownSeparator },
                          ]}
                        />
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.buttonSaveBg}
                  style={styles.loader}
                />
              ) : (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.saveButton,
                      {
                        backgroundColor: colors.buttonSaveBg,
                        shadowColor: colors.buttonSaveShadow,
                      },
                    ]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
                      Guardar contacto
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.cancelButton,
                      {
                        borderColor: colors.buttonCancelBorder,
                      },
                    ]}
                    onPress={handleClose}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        styles.cancelButtonText,
                        { color: colors.buttonCancelText },
                      ]}
                    >
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    shadowColor: "#000",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingRight: 30,
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
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    shadowColor: "#000",
  },
  dropdownOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  dropdownSeparator: {
    height: 1,
    marginHorizontal: 10,
    marginVertical: 0,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    fontWeight: "600",
  },
  loader: {
    marginVertical: 30,
  },
});
