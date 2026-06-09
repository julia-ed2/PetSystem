import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function PinkHeader({ titulo, onVoltar, children }) {
  return (
    <View style={styles.header}>
      <SafeAreaView>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onVoltar} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.titulo}>{titulo}</Text>
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.pink,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
});