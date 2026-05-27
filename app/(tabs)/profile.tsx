import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Footer from '../../components/ui/Footer';
import ProfileOptionCard from '../../components/ui/ProfileOptionCard';

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

  <View style={styles.topRow}>

    <TouchableOpacity
  style={styles.backButton}
  onPress={() => router.back()}
>
  <Feather
    name="chevron-left"
    size={22}
    color="#FFFFFF"
  />
</TouchableOpacity>

  </View>

  <View style={styles.avatar}>
    <Text style={styles.avatarText}>G</Text>
  </View>

  <Text style={styles.userName}>
    Geizi
  </Text>

</View>

      <View style={styles.content}>

<ProfileOptionCard
  icon="user"
  title="Dados pessoais"
  subtitle="Nome, telefone e endereço"
  onPress={() => router.push("/edit-profile")}
/>

<ProfileOptionCard
  icon="github"
  title="Meus pets"
  subtitle="Animais cadastrados"
  onPress={() => router.push("/pets-register")}
/>

<Text style={styles.preferenceTitle}>
  Preferências
</Text>

<ProfileOptionCard
  icon="bell"
  title="Notificações"
  subtitle="Lembretes e avisos"
   hasSwitch
/> 

<TouchableOpacity
  style={styles.logoutContainer}
  onPress={() => router.push('/login')}
>

  <Feather
    name="log-out"
    size={18}
    color="rgba(196, 0, 0, 1)"
  />

  <Text style={styles.logoutText}>
    Encerrar sessão
  </Text>

</TouchableOpacity>

      </View>

      <Footer />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },

  header: {
    backgroundColor: '#E61E78',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  
  },

  topRow: {
  width: '100%',
  paddingHorizontal: 20,
  marginBottom: 20,
},

backButton: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: 'rgba(255,255,255,0.25)',

  justifyContent: 'center',
  alignItems: 'center',
},

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E61E78',
  },

  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  preferenceTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#111',
  marginTop: 14,
  marginBottom: 18,
},

logoutContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 30,
},

logoutText: {
  color: 'rgba(196, 0, 0, 1)',
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 8,
},

});