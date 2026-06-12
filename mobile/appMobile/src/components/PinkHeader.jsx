import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function PinkHeader({ titulo, icone, onVoltar, children }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        {onVoltar ? (
          <TouchableOpacity onPress={onVoltar} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleGroup}>
          {icone ? (
            <View style={styles.iconWrap}>
              <Ionicons name={icone} size={15} color={COLORS.white} />
            </View>
          ) : null}
          <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.pink,
    paddingBottom:   10,
  },
  topRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingTop:        10,
    marginBottom:      4,
  },
  backBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  placeholder: { width: 38 },
  titleGroup: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginLeft:    10,
  },
  iconWrap: {
    width:           28,
    height:          28,
    borderRadius:    9,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  titulo: {
    fontSize:   17,
    fontWeight: '700',
    color:      COLORS.white,
    flexShrink: 1,
  },
});
