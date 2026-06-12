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

const EXAM_COLOR = '#607D8B';

function ExameCard({ exame, isLast }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={styles.dot} />
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            <Ionicons name="document-text" size={16} color={EXAM_COLOR} />
          </View>
          <Text style={styles.cardNome} numberOfLines={2}>{exame.nome}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={12} color={EXAM_COLOR} />
            <Text style={styles.metaChipText}>{exame.data}</Text>
          </View>
        </View>

        {exame.descricao ? (
          <Text style={styles.cardDesc}>{exame.descricao}</Text>
        ) : null}

        {exame.arquivo ? (
          <TouchableOpacity style={styles.arquivoBtn} activeOpacity={0.8}>
            <Ionicons name="document-attach-outline" size={13} color={COLORS.white} />
            <Text style={styles.arquivoText}>{exame.arquivo}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default function ExamesScreen({ navigation }) {
  const { pets, loadPets } = useApp();
  const [petSel,  setPetSel]  = useState(null);
  const [exames,  setExames]  = useState([]);
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
    api.getExames(petSel.id)
      .then(e => setExames(e))
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [petSel]);

  useFocusEffect(carregar);

  const renderHeader = () => (
    <View style={styles.resumo}>
      <Ionicons name="stats-chart-outline" size={16} color={EXAM_COLOR} />
      <Text style={styles.resumoText}>
        {exames.length} exame{exames.length !== 1 ? 's' : ''} registrado{exames.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return <Loading />;
    if (erro) return (
      <View style={styles.vazio}>
        <Ionicons name="cloud-offline-outline" size={44} color={COLORS.gray200} />
        <Text style={styles.vazioText}>Falha ao carregar exames.</Text>
        <TouchableOpacity onPress={carregar} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View style={styles.vazio}>
        <Ionicons name="document-text-outline" size={44} color={COLORS.gray200} />
        <Text style={styles.vazioText}>Nenhum exame registrado.</Text>
        <Text style={styles.vazioSub}>Os exames aparecerão após o primeiro registro.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <PinkHeader titulo="Exames" icone="document-text" onVoltar={() => navigation.goBack()}>
        <PetSelector pets={pets} petSelecionado={petSel} onSelect={setPetSel} />
      </PinkHeader>

      <FlatList
        data={exames}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          <ExameCard exame={item} isLast={index === exames.length - 1} />
        )}
        ListHeaderComponent={!loading && !erro && exames.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={carregar} tintColor={COLORS.pink} />
        }
        style={styles.list}
        contentContainerStyle={[styles.listContent, exames.length === 0 && styles.listContentEmpty]}
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
  resumoText: { fontSize: 13, color: EXAM_COLOR, fontWeight: '600' },

  timelineRow:  { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { width: 36, alignItems: 'center' },
  dot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 3, borderColor: EXAM_COLOR,
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
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: EXAM_COLOR + '18',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardNome: {
    fontSize: 15, fontWeight: '700', color: COLORS.gray800,
    flex: 1, flexShrink: 1,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: EXAM_COLOR + '12',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  metaChipText: { fontSize: 12, color: EXAM_COLOR, fontWeight: '600' },
  cardDesc: {
    fontSize: 13, color: COLORS.gray600, lineHeight: 19,
    marginBottom: 10,
  },
  arquivoBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: EXAM_COLOR,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, gap: 5,
  },
  arquivoText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },

  vazio:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  vazioText:{ color: COLORS.gray400, fontSize: 14, marginTop: 12, fontWeight: '600' },
  vazioSub: { color: COLORS.gray400, fontSize: 12, marginTop: 4, textAlign: 'center' },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: EXAM_COLOR, borderRadius: 8,
  },
  retryText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
