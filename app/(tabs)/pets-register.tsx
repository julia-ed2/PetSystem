import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PetsRegister() {

  /* FORM */
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");

  /* LISTA DE PETS */
  const [pets, setPets] = useState<any[]>([]);

  /* PET EM EDIÇÃO */
  const [editingId, setEditingId] = useState<number | null>(null);

  /* SALVAR PET */
  function handleSavePet() {

    if (
      petName.trim() === "" ||
      species.trim() === "" ||
      breed.trim() === "" ||
      age.trim() === ""
    ) {
      return;
    }

    /* EDITAR */
    if (editingId) {

      const updatedPets = pets.map((pet) =>

        pet.id === editingId
          ? {
              ...pet,
              petName,
              species,
              breed,
              age,
            }
          : pet
      );

      setPets(updatedPets);

      setEditingId(null);

    } else {

      /* NOVO PET */
      const newPet = {
        id: Date.now(),
        petName,
        species,
        breed,
        age,
      };

      setPets([...pets, newPet]);
    }

    /* LIMPAR FORM */
    setPetName("");
    setSpecies("");
    setBreed("");
    setAge("");
  }

  /* EDITAR PET */
  function handleEditPet(pet: any) {

    setPetName(pet.petName);
    setSpecies(pet.species);
    setBreed(pet.breed);
    setAge(pet.age);

    setEditingId(pet.id);
  }

  /* EXCLUIR PET */
  function handleDeletePet(id: number) {

    const filteredPets = pets.filter(
      (pet) => pet.id !== id
    );

    setPets(filteredPets);

    if (editingId === id) {

      setEditingId(null);

      setPetName("");
      setSpecies("");
      setBreed("");
      setAge("");
    }
  }

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* CARD PRINCIPAL */}
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
              Cadastro de Pets
            </Text>

          </View>

          {/* FORM */}
          <View style={styles.form}>

            <Text style={styles.label}>
              Nome do Pet
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite o nome do pet"
              placeholderTextColor="#999"
              value={petName}
              onChangeText={setPetName}
            />

            <Text style={styles.label}>
              Espécie
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: Cachorro"
              placeholderTextColor="#999"
              value={species}
              onChangeText={setSpecies}
            />

            <Text style={styles.label}>
              Raça
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a raça"
              placeholderTextColor="#999"
              value={breed}
              onChangeText={setBreed}
            />

            <Text style={styles.label}>
              Idade
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a idade"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />

          </View>

          {/* BOTÃO */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePet}
          >

            <Text style={styles.saveText}>

              {editingId
                ? "Salvar Alterações"
                : "Cadastrar Pet"}

            </Text>

          </TouchableOpacity>

        </View>

        {/* LISTA DE PETS */}
        {pets.length > 0 && (

          <View style={styles.listContainer}>

            <Text style={styles.listTitle}>
              Pets cadastrados
            </Text>

            {pets.map((pet) => (

              <View
                key={pet.id}
                style={styles.petCard}
              >

                {/* INFO */}
                <View>

                  <Text style={styles.petName}>
                    {pet.petName}
                  </Text>

                  <Text style={styles.petInfo}>
                    {pet.species} • {pet.breed}
                  </Text>

                  <Text style={styles.petAge}>
                    {pet.age} anos
                  </Text>

                </View>

                {/* BOTÕES */}
                <View style={styles.actions}>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditPet(pet)}
                  >
                    <Feather
                      name="edit-2"
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePet(pet.id)}
                  >
                    <Feather
                      name="trash-2"
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                </View>

              </View>

            ))}

          </View>

        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 20,
  },

  /* CENTRALIZAÇÃO */
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },

  /* CARD */
  card: {
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

  /* BOTÃO */
  saveButton: {
    backgroundColor: "#E61E78",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  /* LISTA */
  listContainer: {
    marginTop: 24,
    marginBottom: 30,
  },

  listTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 18,
  },

  /* CARD PET */
  petCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 4,
  },

  petName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E61E78",
    marginBottom: 4,
  },

  petInfo: {
    color: "#444",
    fontSize: 14,
    marginBottom: 4,
  },

  petAge: {
    color: "#777",
    fontSize: 13,
  },

  /* AÇÕES */
  actions: {
    flexDirection: "row",
  },

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#8A2BE2",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,
  },

  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#B00020",

    justifyContent: "center",
    alignItems: "center",
  },

});