import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';

function Campo({ label, value, onChange, keyboardType, editable = true }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType || 'default'}
        editable={editable}
        placeholderTextColor={COLORS.gray400}
      />
    </View>
  );
}

export default function DadosPessoaisScreen({ navigation }) {
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', celular: '', endereco: '' });
  const [loading, setLoad] = useState(false);

  useEffect(() => {
    api.getUser().then(u => setForm({
      nome: u.nome, email: u.email, cpf: u.cpf,
      celular: u.celular, endereco: u.endereco,
    }));
  }, []);

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function handleSalvar() {
    setLoad(true);
    await api.updateUser(form);
    setLoad(false);
    Alert.alert('Sucesso', 'Dados atualizados!');
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Dados pessoais</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Campo label="Nome completo"  value={form.nome}     onChange={v => set('nome', v)} />
        <Campo label="Email"          value={form.email}    onChange={v => set('email', v)} keyboardType="email-address" />
        <Campo label="CPF"            value={form.cpf}      onChange={v => set('cpf', v)} editable={false} />
        <Campo label="Celular"        value={form.celular}  onChange={v => set('celular', v)} keyboardType="phone-pad" />
        <Campo label="Endereço"       value={form.endereco} onChange={v => set('endereco', v)} />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleSalvar} disabled={loading} activeOpacity={0.85}
        >
          <Text style={styles.btnText}>{loading ? 'Salvando...' : 'Salvar alterações'}</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.gray100, paddingTop: 20 },
  header:  { backgroundColor: COLORS.pink, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, paddingTop: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  titulo:  { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  scroll:  { flex: 1, padding: 16 },
  campo:   { marginBottom: 16 },
  label:   { fontSize: 13, color: COLORS.gray600, marginBottom: 6, fontWeight: '500' },
  input:   { backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.black, borderWidth: 1, borderColor: COLORS.gray200 },
  inputDisabled: { backgroundColor: COLORS.gray100, color: COLORS.gray400 },
  btn:     { backgroundColor: COLORS.pink, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});