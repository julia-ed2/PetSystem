import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Switch,
  StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import Loading from '../components/Loading';

function MenuItem({ icon, titulo, subtitulo, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={22} color={COLORS.gray600} />
      </View>
      <View style={styles.menuTexto}>
        <Text style={styles.menuTitulo}>{titulo}</Text>
        <Text style={styles.menuSubtitulo}>{subtitulo}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
    </TouchableOpacity>
  );
}

export default function PerfilScreen({ navigation }) {
  const [user,          setUser]          = useState(null);
  const [notificacoes,  setNotificacoes]  = useState(true);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    api.getUser().then(u => {
      setUser(u);
      setNotificacoes(u.notificacoes);
      setLoading(false);
    });
  }, []);

  async function toggleNotif(val) {
    setNotificacoes(val);
    await api.toggleNotificacoes();
  }

  function handleLogout() {
    Alert.alert('Encerrar sessão', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await api.logout(); navigation.replace('Login'); } },
    ]);
  }

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header rosa com avatar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.gray800} />
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          {/* Avatar placeholder — troque por <Image /> com a foto do usuário */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={42} color={COLORS.white} />
          </View>
        </View>
        <Text style={styles.nomeUsuario}>{user?.nome}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Dados pessoais + Meus pets */}
        <View style={styles.section}>
          <MenuItem
            icon="person-outline"
            titulo="Dados pessoais"
            subtitulo="Nome, cpf, endereço, contato"
            onPress={() => navigation.navigate('DadosPessoais')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="paw-outline"
            titulo="Meus pets"
            subtitulo="Animais cadastrados"
            onPress={() => navigation.navigate('MeusPets')}
          />
        </View>

        {/* Preferências */}
        <Text style={styles.preferenciasLabel}>PREFERÊNCIAS</Text>

        <View style={styles.section}>
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.gray600} />
            </View>
            <View style={styles.menuTexto}>
              <Text style={styles.menuTitulo}>Notificações</Text>
              <Text style={styles.menuSubtitulo}>Lembretes e avisos</Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={toggleNotif}
              trackColor={{ false: COLORS.gray200, true: COLORS.pink }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Encerrar sessão */}
        <TouchableOpacity onPress={handleLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.pink} />
          <Text style={styles.logoutText}>Encerrar sessão</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.gray100 },

  header: {
    backgroundColor: COLORS.pink,
    paddingBottom: 28,
    alignItems: 'center',
    paddingTop: 16,
  },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarWrap: {
    width: 90, height: 90, borderRadius: 22,
    backgroundColor: COLORS.black,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 20, marginBottom: 10,
    overflow: 'hidden',
  },
  avatar:      { alignItems: 'center', justifyContent: 'center' },
  nomeUsuario: { color: COLORS.white, fontSize: 18, fontWeight: '700' },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  divider: { height: 1, backgroundColor: COLORS.gray100, marginLeft: 70 },

  menuItem:    { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIcon:    { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuTexto:   { flex: 1 },
  menuTitulo:  { fontSize: 15, fontWeight: '600', color: COLORS.black },
  menuSubtitulo:{ fontSize: 12, color: COLORS.gray400, marginTop: 2 },

  preferenciasLabel: { fontSize: 11, fontWeight: '700', color: COLORS.gray400, letterSpacing: 1, marginBottom: 10, marginLeft: 4 },

  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
  },
  logoutText: { color: COLORS.pink, fontSize: 15, fontWeight: '700' },
});