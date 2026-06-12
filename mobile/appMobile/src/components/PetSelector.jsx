import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function PetSelector({ pets, petSelecionado, onSelect, showNovo = false, onNovo }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {pets.map(pet => {
        const ativo = petSelecionado?.id === pet.id;
        return (
          <TouchableOpacity
            key={pet.id}
            onPress={() => onSelect(pet)}
            style={[styles.pill, ativo ? styles.pillAtivo : styles.pillInativo]}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, ativo ? styles.iconAtivo : styles.iconInativo]}>
              <Ionicons
                name="paw"
                size={12}
                color={ativo ? COLORS.pink : 'rgba(255,255,255,0.9)'}
              />
            </View>
            <Text style={[styles.nome, ativo ? styles.nomeAtivo : styles.nomeInativo]}>
              {pet.nome}
            </Text>
          </TouchableOpacity>
        );
      })}

      {showNovo && (
        <TouchableOpacity onPress={onNovo} style={styles.pillNovo} activeOpacity={0.8}>
          <Text style={styles.pillNovoText}>+ Novo pet</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    paddingHorizontal: 16,
    paddingVertical:   10,
    gap:             8,
  },

  pill: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingLeft:   5,
    paddingRight:  14,
    paddingVertical: 5,
    borderRadius:  999,
    borderWidth:   1.5,
    gap:           7,
  },
  pillAtivo: {
    backgroundColor: COLORS.white,
    borderColor:     COLORS.white,
    shadowColor:     '#000',
    shadowOpacity:   0.15,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       4,
  },
  pillInativo: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor:     'rgba(255,255,255,0.40)',
  },

  iconCircle: {
    width:          28,
    height:         28,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconAtivo: {
    backgroundColor: COLORS.pink + '1A',
  },
  iconInativo: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  nome:        { fontSize: 13, fontWeight: '700' },
  nomeAtivo:   { color: COLORS.pink },
  nomeInativo: { color: 'rgba(255,255,255,0.95)' },

  pillNovo: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:    999,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.40)',
    borderStyle:     'dashed',
    backgroundColor: 'transparent',
  },
  pillNovoText: {
    fontSize:   13,
    fontWeight: '600',
    color:      'rgba(255,255,255,0.85)',
  },
});
