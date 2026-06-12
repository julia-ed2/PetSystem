import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import PinkHeader from '../components/PinkHeader';
import PetSelector from '../components/PetSelector';
import Loading from '../components/Loading';

export default function ExamesScreen({ navigation }) {
  const [pets,    setPets]    = useState([]);
  const [petSel,  setPetSel]  = useState(null);
  const [exames,  setExames]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPets().then(p => {
      setPets(p);
      setPetSel(p[0] || null);
    });
  }, []);

  useEffect(() => {
    if (!petSel) return;
    setLoading(true);
    api.getExames(petSel.id).then(e => { setExames(e); setLoading(false); });
  }, [petSel]);

  return (
    <SafeAreaView style={styles.safe}>
      <PinkHeader titulo="Exames" onVoltar={() => navigation.goBack()}>
        <PetSelector pets={pets} petSelecionado={petSel} onSelect={setPetSel} />
      </PinkHeader>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Histórico de exames</Text>

        {loading ? <Loading /> : exames.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="document-outline" size={40} color={COLORS.gray200} />
            <Text style={styles.vazioText}>Nenhum exame registrado.</Text>
          </View>
        ) : (
          exames.map(exame => (
            <View key={exame.id} style={styles.card}>
              <View style={styles.cardBorder} />
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardNome}>{exame.nome}</Text>
                  <Text style={styles.cardData}>{exame.data}</Text>
                </View>
                <Text style={styles.cardDesc}>{exame.descricao}</Text>
                {exame.arquivo && (
                  <TouchableOpacity style={styles.arquivoBtn} activeOpacity={0.8}>
                    <Ionicons name="document" size={13} color={COLORS.white} />
                    <Text style={styles.arquivoText}>{exame.arquivo}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.pink, paddingTop: 20 },
  scroll:  { flex: 1, backgroundColor: COLORS.gray100, paddingHorizontal: 16, paddingTop: 20 },
  titulo:  { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 14 },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardBorder:  { width: 4, backgroundColor: COLORS.pink },
  cardContent: { flex: 1, padding: 14 },
  cardTopRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardNome:    { fontSize: 15, fontWeight: '700', color: COLORS.pink },
  cardData:    { fontSize: 12, color: COLORS.gray400 },
  cardDesc:    { fontSize: 13, color: COLORS.gray800, lineHeight: 19, marginBottom: 10 },

  arquivoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 5,
  },
  arquivoText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },

  vazio:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  vazioText: { color: COLORS.gray400, fontSize: 14, marginTop: 10 },
});