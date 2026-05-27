import React from 'react';
import {
    Image, StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function UpdatesSection() {
  return (
    <View style={styles.container}>

      {/* TÍTULO */}
      <View style={styles.headerRow}>

  <Image
  source={require('../../assets/images/InfoCircleFill.png')}
  style={styles.icon}
/>

  <Text style={styles.title}>
    Atualizações recentes
  </Text>

</View>

      {/* CARD LEMBRETE */}
      <View style={styles.updateCard}>

        <View style={styles.leftBorder} />

        <View style={styles.updateContent}>

          <View style={styles.updateTop}>
            <Text style={styles.updateTitle}>Lembrete</Text>
            <Text style={styles.updateDate}>07/04/26</Text>
          </View>

          <Text style={styles.updateMessage}>
            Há um procedimento marcado para amanhã às 16:00 para Theo
          </Text>

        </View>

      </View>

      {/* CARD LAUDO */}
      <View style={styles.updateCard}>

        <View style={styles.leftBorder} />

        <View style={styles.updateContent}>

          <View style={styles.updateTop}>
            <Text style={styles.updateTitle}>Laudo de exame</Text>
            <Text style={styles.updateDate}>01/02/26</Text>
          </View>

          <Text style={styles.updateMessage}>
            Os resultados dos exames de sangue de Theo já estão disponíveis
          </Text>

          <TouchableOpacity>
            <Text style={styles.resultLink}>
              Visualizar resultados
            </Text>
          </TouchableOpacity>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  title: {
  fontSize: 16,
  fontWeight: '700',
  color: '#000',
  lineHeight: 18, // ajuda a alinhar verticalmente

  },

  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  leftBorder: {
    width: 6,
    backgroundColor: '#8A2BE2',
  },

  updateContent: {
    flex: 1,
    padding: 14,
  },

  updateTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  updateTitle: {
    color: '#8A2BE2',
    fontWeight: 'bold',
    fontSize: 16,
  },

  updateDate: {
    color: '#999',
    fontSize: 12,
  },

  updateMessage: {
    color: '#444',
    fontSize: 15,
    lineHeight: 22,
  },

  resultLink: {
    color: '#3B82F6',
    fontSize: 13,
    marginTop: 10,
    textDecorationLine: 'underline',
  },

  headerRow: {
  flexDirection: 'row',
  alignItems: 'center', // ESSENCIAL
  marginBottom: 14,
},

icon: {
  width: 16,
  height: 16,
  marginRight: 6,
},
});