import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { router } from "expo-router";
import Footer from '../../components/ui/Footer';
import HistoryCard from '../../components/ui/HistoryCard';
import PetSelector from '../../components/ui/PetSelector';

export default function History() {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

  <View style={styles.topRow}>
    
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => router.back()}
    >
      <Feather name="chevron-left" size={22} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={styles.title}>
      Histórico
    </Text>

  </View>

  <PetSelector />

</View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          Histórico clínico
        </Text>

        <HistoryCard
          title="Pós-cirúrgico"
          date="16:35 • 08/04/2026"
          description="Theo está em observação após o procedimento."
          color="#E61E78"
        />

        <HistoryCard
          title="Consulta"
          date="10:20 • 02/04/2026"
          description="Avaliação geral concluída com sucesso."
          color="#7B2CBF"
        />

        <HistoryCard
          title="Vacinação"
          date="14:00 • 28/03/2026"
          description="Vacina anual aplicada sem reações."
          color="#4CAF50"
        />

      </ScrollView>
     <Footer/>

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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111',
  },
});