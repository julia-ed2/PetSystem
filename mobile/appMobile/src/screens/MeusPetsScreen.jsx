import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';
import Loading from '../components/Loading';

export default function MeusPetsScreen({ navigation }) {
  const { pets, loadPets } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPets().finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Meus pets</Text>
      </View>

      <FlatList
        data={pets}
        keyExtractor={p => String(p.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Início', params: { petId: item.id } })}
            activeOpacity={0.8}
          >
            <View style={styles.card}>
              <View style={styles.avatarPet}>
                <Ionicons name="paw" size={24} color={COLORS.pink} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.petNome}>{item.nome}</Text>
                <Text style={styles.petInfo}>{item.especie} • {item.raca} • {item.idade}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="paw-outline" size={40} color={COLORS.gray200} />
            <Text style={styles.vazioText}>Nenhum pet cadastrado.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.gray100, paddingTop: 20 },
  header:  { backgroundColor: COLORS.pink, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, paddingTop: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  titulo:  { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  list:    { padding: 16, flexGrow: 1 },
  card:    { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  avatarPet:{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.pinkLight, alignItems: 'center', justifyContent: 'center' },
  petNome: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  petInfo: { fontSize: 12, color: COLORS.gray400, marginTop: 3 },
  vazio:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  vazioText:{ color: COLORS.gray400, fontSize: 14, marginTop: 10 },
});
