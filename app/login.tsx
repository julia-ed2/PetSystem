import { router } from "expo-router";
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function Login() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Logo e Nome */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />

          <Text style={styles.brandName}>PetSystem</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.title}>Painel de Acesso</Text>

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry={true}
          />

          {/* Esqueceu a senha */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },

  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginTop: 10,
  },

  form: {
    width: '100%',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },

  label: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 20,
    fontSize: 16,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 25,
  },

  forgotPasswordText: {
    color: '#8A2BE2',
    fontWeight: 'bold',
    fontSize: 15,
  },

  button: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});