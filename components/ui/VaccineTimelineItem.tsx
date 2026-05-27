import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

interface Props {
  title: string;
  date: string;
  status: 'done' | 'pending';
  details?: string[];
  isLast?: boolean;
}

export default function VaccineTimelineItem({
  title,
  date,
  status,
  details = [],
  isLast,
}: Props) {
  return (
    <View style={styles.container}>

      {/* TIMELINE LEFT */}
      <View style={styles.left}>
        <View style={styles.dotOuter}>
          <View style={styles.dotInner} />
        </View>

        {!isLast && <View style={styles.line} />}
      </View>

      {/* CARD */}
      <View style={styles.card}>

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* STATUS */}
        <View style={styles.statusRow}>
          <Feather
            name={status === 'done' ? 'check-circle' : 'clock'}
            size={16}
            color={status === 'done' ? '#4CAF50' : '#F39C12'}
          />

          <Text
            style={[
              styles.statusText,
              { color: status === 'done' ? '#4CAF50' : '#F39C12' },
            ]}
          >
            {status === 'done' ? 'Aplicada' : 'Pendente'}
          </Text>
        </View>

        {/* SUB CARD (protótipo parte cinza) */}
        {details.length > 0 && (
          <View style={styles.subCard}>
            {details.map((item, index) => (
              <Text key={index} style={styles.subText}>
                {item}
              </Text>
            ))}
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 22,
  },

  left: {
    width: 28,
    alignItems: 'center',
  },

  dotOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#8A2BE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A2BE2',
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#D6D6D6',
    marginTop: 2,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginLeft: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  date: {
    fontSize: 12,
    color: '#777',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  statusText: {
    marginLeft: 6,
    fontWeight: '600',
  },

  subCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 10,
  },

  subText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
});