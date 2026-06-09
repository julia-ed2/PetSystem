import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function PetSelector({ pets, petSelecionado, onSelect, showNovo = false, onNovo }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {pets.map(pet => {
        const ativo = petSelecionado?.id === pet.id;
        return (
          <TouchableOpacity
            key={pet.id}
            onPress={() => onSelect(pet)}
            style={[styles.pill, ativo ? styles.pillAtivo : styles.pillInativo]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="paw"
              size={14}
              color={ativo ? COLORS.pink : COLORS.gray600}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.pillText, ativo ? styles.pillTextAtivo : styles.pillTextInativo]}>
              {pet.nome}
            </Text>
          </TouchableOpacity>
        );
      })}

      {showNovo && (
        <TouchableOpacity onPress={onNovo} style={styles.pillNovo} activeOpacity={0.8}>
          <Text style={styles.pillNovoText}>+ Novo</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  pillAtivo: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.pink,
  },
  pillInativo: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextAtivo: {
    color: COLORS.pink,
  },
  pillTextInativo: {
    color: COLORS.white,
  },
  pillNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  pillNovoText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});