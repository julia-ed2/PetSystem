import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import PinkHeader from '../components/PinkHeader';
import PetSelector from '../components/PetSelector';
import Loading from '../components/Loading';

function HistoricoCard({ item }) {
  const corBorda = item.cor === 'pink' ? COLORS.pink : COLORS.purple;
  const corTitulo = item.cor === 'pink' ? COLORS.pink : COLORS.purple;

  // Processa negrito simples: **texto** → bold
  function renderDescricao(texto) {
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
    <View style={[styles.card, { borderLeftColor: corBorda }]}>
      <View style={styles.cardTopRow}>
        <Text style={[styles.cardTipo, { color: corTitulo }]}>{item.tipo}</Text>
        {item.hora ? (
          <Text style={styles.cardMeta}>{item.hora} • {item.data}</Text>
        ) : null}
      </View>
      {renderDescricao(item.descricao)}
    </View>
  );
}

export default function HistoricoScreen({ navigation }) {
  const [pets,      setPets]      = useState([]);
  const [petSel,    setPetSel]    = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.getPets().then(p => { setPets(p); setPetSel(p[0] || null); });
  }, []);

  useEffect(() => {
    if (!petSel) return;
    setLoading(true);
    api.getHistorico(petSel.id).then(h => { setHistorico(h); setLoading(false); });
  }, [petSel]);

  return (
    <SafeAreaView style={styles.safe}>
      <PinkHeader titulo="Histórico" onVoltar={() => navigation.goBack()}>
        <PetSelector pets={pets} petSelecionado={petSel} onSelect={setPetSel} />
      </PinkHeader>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Histórico clinico</Text>

        {loading ? <Loading /> : historico.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="time-outline" size={40} color={COLORS.gray200} />
            <Text style={styles.vazioText}>Nenhum registro clínico.</Text>
          </View>
        ) : (
          historico.map(item => <HistoricoCard key={item.id} item={item} />)
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.pink, paddingTop: 20 },
  scroll: { flex: 1, backgroundColor: COLORS.gray100, paddingHorizontal: 16, paddingTop: 20 },
  titulo: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 14 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTipo:   { fontSize: 15, fontWeight: '700' },
  cardMeta:   { fontSize: 12, color: COLORS.gray400 },
  cardDesc:   { fontSize: 13, color: COLORS.gray800, lineHeight: 20 },

  vazio:     { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  vazioText: { color: COLORS.gray400, fontSize: 14, marginTop: 10 },
});