import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import { useApp } from '../context/AppContext';
import PinkHeader from '../components/PinkHeader';
import PetSelector from '../components/PetSelector';
import Loading from '../components/Loading';

function VacinaCard({ vacina, isLast }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={styles.dot} />
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardNome}>{vacina.nome}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.purple} />
            <Text style={styles.metaChipText}>{vacina.data}</Text>
          </View>
          {vacina.lote ? (
            <View style={styles.metaChip}>
              <Ionicons name="barcode-outline" size={12} color={COLORS.gray600} />
              <Text style={[styles.metaChipText, { color: COLORS.gray600 }]}>Lote: {vacina.lote}</Text>
            </View>
          ) : null}
        </View>

        {vacina.proximoReforco ? (
          <View style={styles.reforcoRow}>
            <Ionicons name="alarm-outline" size={13} color={COLORS.pink} />
            <Text style={styles.reforcoText}>Próximo reforço: {vacina.proximoReforco}</Text>
          </View>
        ) : (
          <View style={styles.reforcoRow}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#4CAF50" />
            <Text style={[styles.reforcoText, { color: '#4CAF50' }]}>Sem reforço pendente</Text>
          </View>
        )}

        {vacina.veterinario ? (
          <View style={styles.vetRow}>
            <Ionicons name="person-outline" size={13} color={COLORS.gray400} />
            <Text style={styles.vetNome}>{vacina.veterinario}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function VacinasScreen({ navigation }) {
  const { pets, loadPets } = useApp();
  const [petSel,  setPetSel]  = useState(null);
  const [vacinas, setVacinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(false);

  useEffect(() => {
    loadPets().then(p => {
      if (p.length > 0) setPetSel(p[0]);
    });
  }, []);

  const carregar = useCallback(() => {
    if (!petSel) return;
    setErro(false);
    setLoading(true);
    api.getVacinas(petSel.id)
      .then(v => setVacinas(v))
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [petSel]);

  useFocusEffect(carregar);

  const renderHeader = () => (
    <View style={styles.resumo}>
      <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.purple} />
      <Text style={styles.resumoText}>
        {vacinas.length} vacina{vacinas.length !== 1 ? 's' : ''} registrada{vacinas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return <Loading />;
    if (erro) return (
      <View style={styles.vazio}>
        <Ionicons name="cloud-offline-outline" size={44} color={COLORS.gray200} />
        <Text style={styles.vazioText}>Falha ao carregar vacinas.</Text>
        <TouchableOpacity onPress={carregar} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View style={styles.vazio}>
        <Ionicons name="medical-outline" size={44} color={COLORS.gray200} />
        <Text style={styles.vazioText}>Nenhuma vacina registrada.</Text>
        <Text style={styles.vazioSub}>Consulte o veterinário para registrar as vacinas.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <PinkHeader titulo="Cartão de Vacina" icone="medical" onVoltar={() => navigation.goBack()}>
        <PetSelector pets={pets} petSelecionado={petSel} onSelect={setPetSel} />
      </PinkHeader>

      <FlatList
        data={vacinas}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          <VacinaCard vacina={item} isLast={index === vacinas.length - 1} />
        )}
        ListHeaderComponent={!loading && !erro && vacinas.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={carregar} tintColor={COLORS.pink} />
        }
        style={styles.list}
        contentContainerStyle={[styles.listContent, vacinas.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: COLORS.pink },
  list:             { flex: 1, backgroundColor: COLORS.gray100 },
  listContent:      { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  listContentEmpty: { flexGrow: 1 },

  resumo: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 16, paddingHorizontal: 4,
  },
  resumoText: { fontSize: 13, color: COLORS.purple, fontWeight: '600' },

  timelineRow:  { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { width: 36, alignItems: 'center' },
  dot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 3, borderColor: COLORS.purple,
    backgroundColor: COLORS.white,
    marginTop: 18,
  },
  line: { width: 2, flex: 1, backgroundColor: COLORS.gray200, marginTop: 2 },

  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    marginLeft: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardNome: {
    fontSize: 15, fontWeight: '700', color: COLORS.purple,
    marginBottom: 8, flexShrink: 1,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  metaChipText: { fontSize: 12, color: COLORS.purple, fontWeight: '600' },
  reforcoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginBottom: 6,
  },
  reforcoText: { fontSize: 12, color: COLORS.pink, fontWeight: '600' },
  vetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 2,
  },
  vetNome: { fontSize: 12, color: COLORS.gray400 },

  vazio:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  vazioText:{ color: COLORS.gray400, fontSize: 14, marginTop: 12, fontWeight: '600' },
  vazioSub: { color: COLORS.gray400, fontSize: 12, marginTop: 4, textAlign: 'center' },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: COLORS.purple, borderRadius: 8,
  },
  retryText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
