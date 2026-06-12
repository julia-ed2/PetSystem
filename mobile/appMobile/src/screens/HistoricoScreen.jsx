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

const ICONE_TIPO = {
  'Consulta':  'medkit-outline',
  'Exame':     'document-text-outline',
  'Vacinação': 'medical-outline',
  'Cirurgia':  'cut-outline',
  'Passeio':   'paw-outline',
};

const COR_TIPO = {
  'Consulta':  COLORS.purple,
  'Exame':     '#607D8B',
  'Vacinação': COLORS.pink,
  'Cirurgia':  COLORS.pink,
  'Passeio':   '#2196F3',
};

function HistoricoCard({ item }) {
  const cor    = COR_TIPO[item.tipo]   || COLORS.purple;
  const icone  = ICONE_TIPO[item.tipo] || 'time-outline';

  function renderDescricao(texto) {
    if (!texto) return null;
    const partes = texto.split(/\*\*(.*?)\*\*/g);
    return (
      <Text style={styles.cardDesc}>
        {partes.map((p, i) =>
          i % 2 === 1
            ? <Text key={i} style={{ fontWeight: '700' }}>{p}</Text>
            : p
        )}
      </Text>
    );
  }

  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconWrap, { backgroundColor: cor + '18' }]}>
          <Ionicons name={icone} size={18} color={cor} />
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardTipo, { color: cor }]}>{item.tipo}</Text>
          <View style={styles.cardMeta}>
            {item.hora ? <Text style={styles.cardMetaText}>{item.hora}</Text> : null}
            {item.data ? <Text style={styles.cardMetaText}>{item.data}</Text> : null}
          </View>
        </View>
        {renderDescricao(item.descricao)}
      </View>
    </View>
  );
}

export default function HistoricoScreen({ navigation }) {
  const { pets, loadPets } = useApp();
  const [petSel,    setPetSel]    = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(false);

  useEffect(() => {
    loadPets().then(p => {
      if (p.length > 0) setPetSel(p[0]);
    });
  }, []);

  const carregar = useCallback(() => {
    if (!petSel) return;
    setErro(false);
    setLoading(true);
    api.getHistorico(petSel.id)
      .then(h => setHistorico(h))
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [petSel]);

  useFocusEffect(carregar);

  const renderHeader = () => (
    <Text style={styles.titulo}>Histórico clínico</Text>
  );

  const renderEmpty = () => {
    if (loading) return <Loading />;
    if (erro) return (
      <View style={styles.vazio}>
        <Ionicons name="cloud-offline-outline" size={44} color={COLORS.gray200} />
        <Text style={styles.vazioText}>Falha ao carregar histórico.</Text>
        <TouchableOpacity onPress={carregar} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View style={styles.vazio}>
        <Ionicons name="time-outline" size={44} color={COLORS.gray200} />
        <Text style={styles.vazioText}>Nenhum registro clínico.</Text>
        <Text style={styles.vazioSub}>O histórico aparecerá após a primeira consulta.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <PinkHeader titulo="Histórico" icone="time" onVoltar={() => navigation.goBack()}>
        <PetSelector pets={pets} petSelecionado={petSel} onSelect={setPetSel} />
      </PinkHeader>

      <FlatList
        data={historico}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <HistoricoCard item={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={carregar} tintColor={COLORS.pink} />
        }
        style={styles.list}
        contentContainerStyle={[styles.listContent, historico.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: COLORS.pink },
  list:             { flex: 1, backgroundColor: COLORS.gray100 },
  listContent:      { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },
  listContentEmpty: { flexGrow: 1 },

  titulo: { fontSize: 15, fontWeight: '700', color: COLORS.gray800, marginBottom: 14 },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  cardLeft:  { paddingLeft: 12, paddingTop: 14, paddingBottom: 14 },
  iconWrap:  {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardRight: { flex: 1, padding: 14, paddingLeft: 10 },
  cardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 6,
  },
  cardTipo:     { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  cardMeta:     { alignItems: 'flex-end' },
  cardMetaText: { fontSize: 11, color: COLORS.gray400, lineHeight: 16 },
  cardDesc:     { fontSize: 13, color: COLORS.gray800, lineHeight: 20 },

  vazio:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  vazioText:{ color: COLORS.gray400, fontSize: 14, marginTop: 12, fontWeight: '600' },
  vazioSub: { color: COLORS.gray400, fontSize: 12, marginTop: 4, textAlign: 'center' },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: COLORS.purple, borderRadius: 8,
  },
  retryText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
