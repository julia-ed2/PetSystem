import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  date: string;
  description: string;
  color: string;
}

export default function HistoryCard({
  title,
  date,
  description,
  color,
}: Props) {
  return (
    <View style={styles.card}>
      
      <View
        style={[
          styles.sideBar,
          { backgroundColor: color },
        ]}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color }]}>
          {title}
        </Text>

        <Text style={styles.date}>
          {date}
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },

  sideBar: {
    width: 8,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  date: {
    color: '#777',
    marginBottom: 10,
    fontSize: 13,
  },

  description: {
    color: '#444',
    lineHeight: 20,
  },
});