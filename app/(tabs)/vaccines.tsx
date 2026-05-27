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
import PetSelector from '../../components/ui/PetSelector';
import VaccineTimelineItem from '../../components/ui/VaccineTimelineItem';

export default function Vaccines() {
  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <View style={styles.topRow}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Vacinas</Text>
        </View>

        <PetSelector />
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.sectionTitle}>
          Calendário vacinal
        </Text>

        {/* ITEM 1 */}
        <VaccineTimelineItem
          title="V10 Polivalente"
          date="Reforço em 02/04/2027"
          status="done"
          details={[
            "Responsável: Dr. Carlos Silva",
          ]}
        />

        {/* ITEM 2 */}
        <VaccineTimelineItem
          title="Raiva"
          date="Aplicada em 20/05/2026"
          status="pending"
          details={[
            "Responsável: Dra. Fernanda Souza",
          ]}
        />

        {/* ITEM 3 */}
        <VaccineTimelineItem
          title="Leishmaniose"
          date="Pendente"
          status="pending"
          details={[
            "Responsável: Dr. Ricardo Lima",
          ]}
          isLast
        />

      </ScrollView>

      {/* FOOTER */}
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