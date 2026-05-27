import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PetSelector() {
  const [selectedPet, setSelectedPet] = useState('Theo');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          selectedPet === 'Theo' && styles.activeButton,
        ]}
        onPress={() => setSelectedPet('Theo')}
      >
        <Text
          style={[
            styles.text,
            selectedPet === 'Theo' && styles.activeText,
          ]}
        >
          Theo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          selectedPet === 'Mel' && styles.activeButton,
        ]}
        onPress={() => setSelectedPet('Mel')}
      >
        <Text
          style={[
            styles.text,
            selectedPet === 'Mel' && styles.activeText,
          ]}
        >
          Mel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  /* Botão normal = rosa transparente */
  button: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  /* Botão selecionado = branco */
  activeButton: {
    backgroundColor: '#FFFFFF',
  },

  /* Texto normal = branco */
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* Texto selecionado = rosa */
  activeText: {
    color: '#E61E78',
  },
});