import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { api } from '../service/api';
import logoPet from '../assets/logoVet (1).jpeg';


export default function LoginScreen({ navigation }) {
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [loading, setLoad]  = useState(false);

  async function handleLogin() {
    if (!email || !senha) { Alert.alert('Atenção', 'Preencha email e senha.'); return; }
    setLoad(true);
    try {
      await api.login(email, senha);
      // Quando o backend estiver pronto, salve o token aqui (AsyncStorage, SecureStore, etc.)
      navigation.replace('MainTabs');
    } catch (e) {
      Alert.alert('Erro', 'Email ou senha inválidos.');
    } finally {
      setLoad(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={20} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoContainer}>
            {/* Substitua por <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
            <View style={styles.logoPlaceholder}>
              
              <Image source={require('../assets/logoVet (1).png')} className ='w-20 h-20' /> 
          
            </View>
            <Text style={styles.logoText}>PetSystem</Text>
          </View>

          {/* Card de login */}
          <View style={styles.card}>
            <Text style={styles.titulo}>Painel de Acesso</Text>

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.gray400}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Senha:</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholderTextColor={COLORS.gray400}
            />

            <TouchableOpacity style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnEntrar, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnEntrarText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray100, paddingTop: 20 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logoContainer: { alignItems: 'center', marginBottom: 40
  },
  logoText: { fontSize: 26, fontWeight: '800', color: COLORS.purple },
  card: { width: '100%' },
  titulo: { fontSize: 20, fontWeight: '800', color: COLORS.black, marginBottom: 24 },
  label: { fontSize: 14, color: COLORS.black, marginBottom: 6 },
  input: {
    width: '100%', height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 12, paddingHorizontal: 16,
    fontSize: 15, color: COLORS.black,
    borderWidth: 1, borderColor: COLORS.gray200,
  },
  forgotContainer: { alignItems: 'flex-end', marginTop: 10, marginBottom: 28 },
  forgotText: { color: COLORS.purple, fontSize: 14, fontWeight: '600' },
  btnEntrar: {
    backgroundColor: COLORS.purple,
    height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  btnEntrarText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});