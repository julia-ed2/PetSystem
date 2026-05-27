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

export default function Exams() {
  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
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

          <Text style={styles.title}>
            Exames
          </Text>
        </View>

        <PetSelector />

      </View>

      {/* CONTEÚDO */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.sectionTitle}>
          Histórico de exames
        </Text>

        <View style={styles.examCard}>

          <View style={styles.sideBar} />

          <View style={styles.cardContent}>

            <View style={styles.cardHeader}>
              <Text style={styles.examTitle}>
                Hemograma
              </Text>

              <Text style={styles.date}>
                07/04/2026
              </Text>
            </View>

            <Text style={styles.description}>
              Resultado do exame disponível para download
            </Text>

            <TouchableOpacity style={styles.downloadButton}>

              <Feather
                name="file-text"
                size={14}
                color="#FFFFFF"
              />

              <Text style={styles.downloadText}>
                laudo_exame.pdf
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

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
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111',
  },

  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  sideBar: {
    width: 8,
    backgroundColor: '#E61E78',
  },

  cardContent: {
    flex: 1,
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  examTitle: {
    color: '#E61E78',
    fontSize: 20,
    fontWeight: '700',
  },

  date: {
    color: '#777',
    fontSize: 13,
  },

  description: {
    color: '#444',
    marginBottom: 18,
    lineHeight: 20,
  },

  downloadButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 20,
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  downloadText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
});