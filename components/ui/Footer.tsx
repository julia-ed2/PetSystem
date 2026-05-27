import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.footer}>

      {/* INÍCIO */}
      <TouchableOpacity
        style={[styles.tabItem, isActive('/') && styles.tabItemActive]}
        onPress={() => router.push('/')}
      >
        <Feather
          name="home"
          size={22}
          color={isActive('/') ? '#FFFFFF' : '#8A2BE2'}
        />
        <Text style={[styles.tabText, isActive('/') && styles.tabTextActive]}>
          Início
        </Text>
      </TouchableOpacity>

      {/* EXAMES */}
      <TouchableOpacity
        style={[styles.tabItem, isActive('/exams') && styles.tabItemActive]}
        onPress={() => router.push('/exams')}
      >
        <Feather
          name="file-text"
          size={22}
          color={isActive('/exams') ? '#FFFFFF' : '#8A2BE2'}
        />
        <Text style={[styles.tabText, isActive('/exams') && styles.tabTextActive]}>
          Exames
        </Text>
      </TouchableOpacity>

      {/* VACINAS */}
      <TouchableOpacity
        style={[styles.tabItem, isActive('/vaccines') && styles.tabItemActive]}
        onPress={() => router.push('/vaccines')}
      >
        <Feather
          name="heart"
          size={22}
          color={isActive('/vaccines') ? '#FFFFFF' : '#8A2BE2'}
        />
        <Text style={[styles.tabText, isActive('/vaccines') && styles.tabTextActive]}>
          Vacinas
        </Text>
      </TouchableOpacity>

      {/* HISTÓRICO */}
      <TouchableOpacity
        style={[styles.tabItem, isActive('/history') && styles.tabItemActive]}
        onPress={() => router.push('/history')}
      >
        <Feather
          name="clock"
          size={22}
          color={isActive('/history') ? '#FFFFFF' : '#8A2BE2'}
        />
        <Text style={[styles.tabText, isActive('/history') && styles.tabTextActive]}>
          Histórico
        </Text>
      </TouchableOpacity>

      {/* PERFIL */}
      <TouchableOpacity
        style={[styles.tabItem, isActive('/profile') && styles.tabItemActive]}
        onPress={() => router.push('/profile')}
      >
        <Feather
          name="user"
          size={22}
          color={isActive('/profile') ? '#FFFFFF' : '#8A2BE2'}
        />
        <Text style={[styles.tabText, isActive('/profile') && styles.tabTextActive]}>
          Perfil
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  tabItemActive: {
    backgroundColor: '#8A2BE2',
  },

  tabText: {
    fontSize: 12,
    color: '#8A2BE2',
  },

  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});