import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function EditProfile() {

  /* STATES DOS CAMPOS */
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  /* CONTROLE */
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  return (
    <SafeAreaView style={styles.container}>

      {/* CARD */}
      <View style={styles.card}>

        {/* HEADER */}
        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather
              name="chevron-left"
              size={24}
              color="#E61E78"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Dados Pessoais
          </Text>

        </View>

        {/* STATUS */}
        {isSaved && !isEditing && (
          <View style={styles.savedContainer}>
            <Text style={styles.savedText}>
              ✓ Dados salvos com sucesso
            </Text>
          </View>
        )}

        {/* FORM */}
        <View style={styles.form}>

          <Text style={styles.label}>
            Nome completo
          </Text>

          <TextInput
            style={[
              styles.input,
              !isEditing && styles.disabledInput
            ]}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            editable={isEditing}
          />

          <Text style={styles.label}>
            CPF
          </Text>

          <TextInput
            style={[
              styles.input,
              !isEditing && styles.disabledInput
            ]}
            placeholder="000.000.000-00"
            placeholderTextColor="#999"
            value={cpf}
            onChangeText={setCpf}
            editable={isEditing}
          />

          <Text style={styles.label}>
            Telefone
          </Text>

          <TextInput
            style={[
              styles.input,
              !isEditing && styles.disabledInput
            ]}
            placeholder="(11) 99999-9999"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
          />

          <Text style={styles.label}>
            Endereço
          </Text>

          <TextInput
            style={[
              styles.input,
              !isEditing && styles.disabledInput
            ]}
            placeholder="Digite seu endereço"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
            editable={isEditing}
          />

        </View>

        {/* BOTÕES */}
        <View style={styles.actions}>

          {/* SALVAR */}
          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                setIsSaved(true);
                setIsEditing(false);
              }}
            >
              <Text style={styles.saveText}>
                Salvar
              </Text>
            </TouchableOpacity>
          )}

          {/* EDITAR / EXCLUIR */}
          {isSaved && !isEditing && (

            <View style={styles.secondaryActions}>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.secondaryText}>
                  ✏️ Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setName("");
                  setCpf("");
                  setPhone("");
                  setAddress("");

                  setIsSaved(false);
                  setIsEditing(true);
                }}
              >
                <Text style={styles.secondaryText}>
                  🗑 Excluir
                </Text>
              </TouchableOpacity>

            </View>

          )}

        </View>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  /* CARD */
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 6,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backButton: {
    marginRight: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  /* STATUS */
  savedContainer: {
    backgroundColor: "#E8F8EC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },

  savedText: {
    color: "#1B8A3D",
    fontWeight: "600",
    textAlign: "center",
  },

  /* FORM */
  form: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    color: "#111",
  },

  /* INPUT BLOQUEADO */
  disabledInput: {
    backgroundColor: "#ECECEC",
    color: "#777",
  },

  /* BOTÕES */
  actions: {
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: "#E61E78",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#BDBDBD",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#B00020",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },

  secondaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

});