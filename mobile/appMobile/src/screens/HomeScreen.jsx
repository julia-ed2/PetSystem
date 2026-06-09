import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import PetSelector from '../components/PetSelector';
import Loading from '../components/Loading';

export default function HomeScreen({ navigation, route }) {
  const [pets,          setPets]          = useState([]);
  const [petSel,        setPetSel]        = useState(null);
  const [user,          setUser]          = useState(null);
  const [atualizacoes,  setAtualizacoes]  = useState([]);
  const [atendimento,   setAtendimento]   = useState(null);
  const [meta,          setMeta]          = useState(null);
  const [petHistorico,  setPetHistorico]  = useState([]);
  const [petMeta,       setPetMeta]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  async function carregar() {
    const [u, p, at, atu, m] = await Promise.all([
      api.getUser(),
      api.getPets(),
      api.getAtendimento(),
      api.getAtualizacoes(),
      api.getMeta(),
    ]);
    setUser(u);
    setPets(p);
    setPetSel(p[0] || null);
    setAtendimento(at);
    setAtualizacoes(atu);
    setMeta(m);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  // Se vier um pet selecionado via params (ex: vindo de MeusPets), atualiza seleção
  useEffect(() => {
    const petId = route?.params?.petId;
    if (petId && pets.length) {
      const found = pets.find(p => p.id === petId);
      if (found) setPetSel(found);
    }
  }, [route?.params?.petId, pets]);

  // Buscar histórico e meta do pet selecionado
  useEffect(() => {
    if (!petSel) {
      setPetHistorico([]);
      setPetMeta(null);
      return;
    }

    let mounted = true;
    (async () => {
      const [h, mPet] = await Promise.all([
        api.getHistorico(petSel.id),
        api.getMetaPet(petSel.id),
      ]);
      if (!mounted) return;
      setPetHistorico(h);
      setPetMeta(mPet);
    })();

    return () => { mounted = false; };
  }, [petSel]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }, []);

  if (loading) return <Loading />;

  const progresso = meta ? meta.realizado / meta.objetivo : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header rosa */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* Logo placeholder */}
          <View style={styles.logoCircle}>
            <Text style={{ fontSize: 22 }}>🐾</Text>
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.ola}>Olá, {user?.nome?.split(' ')[0]}</Text>
            <Text style={styles.subtitulo}>Veja as informações sobre o seus pets</Text>
          </View>
        </View>

        <PetSelector
          pets={pets}
          petSelecionado={petSel}
          onSelect={setPetSel}

        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.pink]} />}
      >
        {/* Banner atendimento em andamento */}
        {atendimento?.ativo && (
          <TouchableOpacity style={styles.banner} activeOpacity={0.85}>
            <View>
              <Text style={styles.bannerLabel}>ATENDIMENTO EM ANDAMENTO:</Text>
              <Text style={styles.bannerDescricao}>{atendimento.descricao}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {/* Botão rosa grande: mostra apenas se o pet selecionado estiver em atendimento */}
        {atendimento?.ativo && petSel?.id === atendimento.petId && (
          <View style={styles.bigBtnWrap}>
            <TouchableOpacity style={styles.bigBtn} onPress={() => navigation.navigate('Histórico')} activeOpacity={0.85}>
              <Text style={styles.bigBtnText}>Ver histórico do atendimento</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Atualizações recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={18} color={COLORS.black} />
            <Text style={styles.sectionTitulo}>Atualizações recentes</Text>
          </View>

          {atualizacoes.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardBorder} />
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTipo}>{item.tipo}</Text>
                  <Text style={styles.cardData}>{item.data}</Text>
                </View>
                <Text style={styles.cardDesc}>{item.descricao}</Text>
                {item.link && (
                  <TouchableOpacity>
                    <Text style={styles.cardLink}>{item.link}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
        {/* Meta de passeios por pet (gamificável) */}
        {petMeta && (
          <View style={styles.metaCard}>
            <View style={styles.metaTop}>
              <View style={styles.metaIconWrap}>
                <Text style={{ fontSize: 22 }}>🚶</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.metaTitulo}>Meta de passeios — {petSel?.nome}</Text>
                <Text style={styles.metaSubtitulo}>Objetivo: {petMeta.objetivo} {petMeta.unidade}</Text>
              </View>
              <TouchableOpacity onPress={async () => {
                const novo = await api.updateMetaPet(petSel.id, { objetivo: petMeta.objetivo });
                setPetMeta(novo);
              }}>
                <Ionicons name="pencil" size={16} color={COLORS.pink} />
              </TouchableOpacity>
            </View>
            {/* Barra de progresso por pet */}
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min((petMeta.realizado / petMeta.objetivo) * 100, 100)}%` }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text style={styles.metaContador}>{petMeta.realizado}/{petMeta.objetivo}</Text>
              <TouchableOpacity style={styles.smallBtn} onPress={async () => {
                const atualizado = await api.incrementPasseio(petSel.id);
                setPetMeta(atualizado);
              }}>
                <Text style={styles.smallBtnText}>Registrar passeio</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.pinkBg },
  header:      { backgroundColor: COLORS.pinkBg, paddingBottom: 4 },
  headerTop:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  logoCircle:  { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  ola:         { fontSize: 20, fontWeight: '800', color: COLORS.pink },
  subtitulo:   { fontSize: 12, color: COLORS.gray600, marginTop: 1 },

  scroll: { flex: 1, backgroundColor: COLORS.gray100 },

  banner: {
    margin: 16,
    backgroundColor: COLORS.pink,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLabel:    { fontSize: 11, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
  bannerDescricao:{ fontSize: 16, fontWeight: '600', color: COLORS.white, marginTop: 3 },

  section:       { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  sectionTitulo: { fontSize: 16, fontWeight: '700', color: COLORS.black },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardBorder:  { width: 4, backgroundColor: COLORS.purple },
  cardContent: { flex: 1, padding: 14 },
  cardTopRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardTipo:    { fontSize: 14, fontWeight: '700', color: COLORS.purple },
  cardData:    { fontSize: 12, color: COLORS.gray400 },
  cardDesc:    { fontSize: 13, color: COLORS.gray800, lineHeight: 19 },
  cardLink:    { fontSize: 13, color: COLORS.purple, fontWeight: '600', marginTop: 6, textDecorationLine: 'underline' },

  metaCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  metaTop:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  metaIconWrap:  { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.pinkLight, alignItems: 'center', justifyContent: 'center' },
  metaTitulo:    { fontSize: 14, fontWeight: '700', color: COLORS.black },
  metaSubtitulo: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  progressBg:    { height: 8, backgroundColor: COLORS.gray200, borderRadius: 99, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: COLORS.pink, borderRadius: 99 },
  metaContador:  { fontSize: 12, color: COLORS.gray400, textAlign: 'right', marginTop: 6 },
  bigBtnWrap: { paddingHorizontal: 16, marginTop: 12 },
  bigBtn: { backgroundColor: COLORS.pink, borderRadius: 14, paddingVertical: 16, alignItems: 'center', paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  bigBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  smallBtn: { backgroundColor: COLORS.purple, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  smallBtnText: { color: COLORS.white, fontWeight: '700' },
});