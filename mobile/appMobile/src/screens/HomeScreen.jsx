import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  TextInput, Animated, KeyboardAvoidingView, Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import PetSelector from '../components/PetSelector';
import Loading from '../components/Loading';

const COR_AGENDAMENTO = {
  'Consulta':    COLORS.purple,
  'Vacinação':   COLORS.pink,
  'Cirurgia':    COLORS.pink,
  'Banho e Tosa': '#2196F3',
  'Retorno':     COLORS.purple,
};

function AgendamentoCard({ item }) {
  const cor = COR_AGENDAMENTO[item.tipo] || COLORS.purple;
  return (
    <View style={styles.agCard}>
      <View style={[styles.agCardBar, { backgroundColor: cor }]} />
      <View style={styles.agCardBody}>
        <View style={styles.agCardRow}>
          <View style={[styles.agTipoBadge, { backgroundColor: cor + '18' }]}>
            <Text style={[styles.agTipoText, { color: cor }]}>{item.tipo}</Text>
          </View>
          <Text style={styles.agData}>{item.data}</Text>
        </View>
        <Text style={styles.agDesc}>{item.descricao}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation, route }) {
  const [pets,               setPets]               = useState([]);
  const [petSel,             setPetSel]             = useState(null);
  const [user,               setUser]               = useState(null);
  const [atualizacoes,       setAtualizacoes]       = useState([]);
  const [atendimento,        setAtendimento]        = useState(null);
  const [petMeta,            setPetMeta]            = useState(null);
  const [editingMeta,        setEditingMeta]        = useState(false);
  const [novoObjetivo,       setNovoObjetivo]       = useState('');
  const [loading,            setLoading]            = useState(true);
  const [refreshing,         setRefreshing]         = useState(false);
  const [registeringPasseio, setRegisteringPasseio] = useState(false);
  const [confirmModalVisible,setConfirmModalVisible]= useState(false);
  const [newPasseioEntry,    setNewPasseioEntry]    = useState(null);
  const iconScale = React.useRef(new Animated.Value(1)).current;

  async function carregar() {
    const [u, p] = await Promise.all([api.getUser(), api.getPets()]);
    setUser(u);
    setPets(p);
    setPetSel(p[0] || null);
  }

  useEffect(() => { carregar(); }, []);

  // Recarregar dados do pet selecionado sempre que ele mudar
  useEffect(() => {
    if (!petSel) {
      setAtualizacoes([]);
      setAtendimento({ ativo: false });
      setPetMeta(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      const [atu, at, mPet] = await Promise.all([
        api.getAtualizacoes(petSel.id),
        api.getAtendimento(),
        api.getMetaPet(petSel.id),
      ]);
      if (!mounted) return;
      setAtualizacoes(atu);
      setAtendimento(at);
      setPetMeta(mPet);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [petSel]);

  // Navegar para pet vindo de outra tela
  useEffect(() => {
    const petId = route?.params?.petId;
    if (petId && pets.length) {
      const found = pets.find(p => p.id === petId);
      if (found) setPetSel(found);
    }
  }, [route?.params?.petId, pets]);

  React.useEffect(() => {
    if (petMeta?.realizado >= petMeta?.objetivo && petMeta?.objetivo > 0) {
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.2, duration: 180, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
  }, [petMeta?.realizado, petMeta?.objetivo, iconScale]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }, []);

  async function handleRegisterPasseio() {
    if (!petMeta || petMeta.realizado >= petMeta.objetivo || registeringPasseio) return;
    setRegisteringPasseio(true);
    try {
      const response = await api.registerPasseio(petSel.id);
      setPetMeta({ ...response.meta });
      setNewPasseioEntry(response.historico);
      setConfirmModalVisible(true);
    } finally {
      setRegisteringPasseio(false);
    }
  }

  async function handleSaveMeta() {
    const objetivoNum = Number(novoObjetivo);
    if (!objetivoNum || objetivoNum < 1) return;
    const atualizado = await api.updateMetaPet(petSel.id, { objetivo: objetivoNum });
    setPetMeta({ ...atualizado, realizado: 0 });
    setEditingMeta(false);
  }

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoCircle}>
            <Text style={{ fontSize: 22 }}>🐾</Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.ola}>Olá, {user?.nome?.split(' ')[0]}</Text>
            <Text style={styles.subtitulo}>Acompanhe a saúde dos seus pets</Text>
          </View>
        </View>
        <PetSelector pets={pets} petSelecionado={petSel} onSelect={setPetSel} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <Modal
          visible={confirmModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Passeio registrado!</Text>
              <Text style={styles.modalDescription}>
                {newPasseioEntry?.descricao || 'O passeio foi salvo no histórico do pet.'}
              </Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => setConfirmModalVisible(false)}>
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.pink]} />}
        >
          {/* Banner atendimento em andamento */}
          {atendimento?.ativo && (
            <TouchableOpacity
              style={styles.banner}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Histórico')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerLabel}>ATENDIMENTO EM ANDAMENTO</Text>
                <Text style={styles.bannerDescricao}>{atendimento.descricao}</Text>
                {atendimento.veterinario ? (
                  <Text style={styles.bannerVet}>Dr(a). {atendimento.veterinario}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {/* Agendamentos do pet selecionado */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.gray600} />
              <Text style={styles.sectionTitulo}>
                Agendamentos{petSel ? ` · ${petSel.nome}` : ''}
              </Text>
            </View>

            {atualizacoes.length === 0 ? (
              <View style={styles.vazioCard}>
                <Ionicons name="calendar-outline" size={32} color={COLORS.gray200} />
                <Text style={styles.vazioText}>Nenhum agendamento encontrado.</Text>
              </View>
            ) : (
              atualizacoes.map(item => <AgendamentoCard key={item.id} item={item} />)
            )}
          </View>

          {/* Meta de passeios */}
          {petMeta && (
            <View style={styles.metaCard}>
              <View style={styles.metaTop}>
                <Animated.View style={[styles.metaIconWrap, { transform: [{ scale: iconScale }] }]}>
                  <Ionicons
                    name={petMeta.realizado >= petMeta.objetivo ? 'trophy' : 'paw'}
                    size={22} color={COLORS.white}
                  />
                </Animated.View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.metaTitulo}>Meta de passeios — {petSel?.nome}</Text>
                  <Text style={styles.metaSubtitulo}>Objetivo: {petMeta.objetivo} {petMeta.unidade}</Text>
                </View>
                <TouchableOpacity onPress={() => { setNovoObjetivo(String(petMeta?.objetivo ?? '')); setEditingMeta(true); }}>
                  <Ionicons name="pencil" size={18} color={COLORS.pink} />
                </TouchableOpacity>
              </View>

              {editingMeta && (
                <View style={styles.editMetaRow}>
                  <TextInput
                    style={styles.editMetaInput}
                    value={novoObjetivo}
                    onChangeText={setNovoObjetivo}
                    keyboardType="numeric"
                    placeholder="Novo objetivo"
                    placeholderTextColor={COLORS.gray400}
                  />
                  <View style={styles.editMetaButtons}>
                    <TouchableOpacity style={styles.cancelMetaBtn} onPress={() => setEditingMeta(false)}>
                      <Text style={styles.cancelMetaText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveMetaBtn} onPress={handleSaveMeta}>
                      <Text style={styles.saveMetaText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {
                  width: `${Math.min((petMeta.realizado / petMeta.objetivo) * 100, 100)}%`,
                }]} />
              </View>
              <View style={styles.metaBottom}>
                <Text style={styles.metaContador}>{petMeta.realizado}/{petMeta.objetivo} passeios</Text>
                <TouchableOpacity
                  style={[
                    styles.smallBtn,
                    (petMeta.realizado >= petMeta.objetivo || registeringPasseio) && styles.smallBtnDisabled,
                  ]}
                  onPress={handleRegisterPasseio}
                  disabled={petMeta.realizado >= petMeta.objetivo || registeringPasseio}
                >
                  <Text style={styles.smallBtnText}>
                    {registeringPasseio ? 'Registrando...' : 'Registrar passeio'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.pinkBg, paddingTop: 20 },
  header: { backgroundColor: COLORS.pinkBg, paddingBottom: 8 },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, marginBottom: 4,
  },
  logoCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  ola:       { fontSize: 20, fontWeight: '800', color: COLORS.pink },
  subtitulo: { fontSize: 12, color: COLORS.gray600, marginTop: 1 },

  scroll: { flex: 1, backgroundColor: COLORS.gray100 },

  banner: {
    margin: 16,
    backgroundColor: COLORS.pink,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerLabel:    { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.8, marginBottom: 3 },
  bannerDescricao:{ fontSize: 15, fontWeight: '700', color: COLORS.white },
  bannerVet:      { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  section:       { paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, gap: 6,
  },
  sectionTitulo: { fontSize: 15, fontWeight: '700', color: COLORS.gray800 },

  agCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  agCardBar:  { width: 4 },
  agCardBody: { flex: 1, padding: 14 },
  agCardRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  agTipoBadge:{
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  agTipoText: { fontSize: 12, fontWeight: '700' },
  agData:     { fontSize: 12, color: COLORS.gray400 },
  agDesc:     { fontSize: 13, color: COLORS.gray600 },

  vazioCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  vazioText: { color: COLORS.gray400, fontSize: 13, marginTop: 10 },

  metaCard: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  metaTop:      { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  metaIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.pinkLight || COLORS.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  metaTitulo:    { fontSize: 14, fontWeight: '700', color: COLORS.black },
  metaSubtitulo: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },

  editMetaRow:    { marginBottom: 12 },
  editMetaInput:  {
    backgroundColor: COLORS.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.gray200,
    color: COLORS.black, marginBottom: 10,
  },
  editMetaButtons:{ flexDirection: 'row', justifyContent: 'flex-end' },
  cancelMetaBtn:  { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.gray100 },
  saveMetaBtn:    { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.purple, marginLeft: 8 },
  cancelMetaText: { color: COLORS.gray600, fontWeight: '700' },
  saveMetaText:   { color: COLORS.white, fontWeight: '700' },

  progressBg:   { height: 8, backgroundColor: COLORS.gray200, borderRadius: 99, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: COLORS.pink, borderRadius: 99 },

  metaBottom:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaContador: { fontSize: 12, color: COLORS.gray400 },

  smallBtn:         { backgroundColor: COLORS.purple, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  smallBtnDisabled: { backgroundColor: COLORS.gray200 },
  smallBtnText:     { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalContent:  {
    width: '84%', backgroundColor: COLORS.white, borderRadius: 18,
    padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 10,
  },
  modalTitle:       { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 10 },
  modalDescription: { fontSize: 14, color: COLORS.gray600, textAlign: 'center', marginBottom: 18 },
  modalButton:      { backgroundColor: COLORS.purple, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  modalButtonText:  { color: COLORS.white, fontWeight: '700' },
});
