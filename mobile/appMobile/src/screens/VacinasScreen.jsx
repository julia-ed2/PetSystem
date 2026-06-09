import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import PinkHeader from '../components/PinkHeader';
import PetSelector from '../components/PetSelector';
import Loading from '../components/Loading';

function VacinaItem({ vacina, isLast }) {
  return (
    <View style={styles.timelineRow}>
      {/* Bolinha + linha */}
      <View style={styles.timelineLeft}>
        <View style={styles.dot} />
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardNome}>{vacina.nome}</Text>
          <Text style={styles.cardData}>{vacina.data}</Text>
        </View>
        <Text style={styles.cardReforcao}>Próximo reforço em {vacina.proximoReforcao}</Text>
        <View style={styles.vetRow}>
          <Ionicons name="person-outline" size={13} color={COLORS.gray400} />
          <Text style={styles.vetNome}>{vacina.veterinario}</Text>
        </View>
      </View>
    </View>
  );
}

export default function VacinasScreen({ navigation }) {
  const [pets,    setPets]    = useState([]);
  const [petSel,  setPetSel]  = useState(null);
  const [vacinas, setVacinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPets().then(p => { setPets(p); setPetSel(p[0] || null); });
  }, []);

  useEffect(() => {
    if (!petSel) return;
    setLoading(true);
    api.getVacinas(petSel.id).then(v => { setVacinas(v); setLoading(false); });
  }, [petSel]);

  return (
    <SafeAreaView style={styles.safe}>
      <PinkHeader titulo="Cartão de Vacina" onVoltar={() => navigation.goBack()}>
        <PetSelector pets={pets} petSelecionado={petSel} onSelect={setPetSel} />
      </PinkHeader>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? <Loading /> : vacinas.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="medical-outline" size={40} color={COLORS.gray200} />
            <Text style={styles.vazioText}>Nenhuma vacina registrada.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {vacinas.map((v, i) => (
              <VacinaItem key={v.id} vacina={v} isLast={i === vacinas.length - 1} />
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.pink },
  scroll: { flex: 1, backgroundColor: COLORS.gray100, paddingHorizontal: 16, paddingTop: 20 },

  timeline: { paddingTop: 4 },

  timelineRow: { flexDirection: 'row', marginBottom: 0 },

  timelineLeft: { width: 40, alignItems: 'center' },
  dot: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: COLORS.purple,
    backgroundColor: COLORS.white,
    marginTop: 16,
  },
  line: { width: 2, flex: 1, backgroundColor: COLORS.gray200, marginTop: 2 },

  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginLeft: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardNome:   { fontSize: 15, fontWeight: '700', color: COLORS.purple },
  cardData:   { fontSize: 12, color: COLORS.gray400 },
  cardReforcao:{ fontSize: 13, color: COLORS.gray800, marginBottom: 10 },
  vetRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 5, alignSelf: 'flex-start' },
  vetNome:    { fontSize: 12, color: COLORS.gray600 },

  vazio:     { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  vazioText: { color: COLORS.gray400, fontSize: 14, marginTop: 10 },
});