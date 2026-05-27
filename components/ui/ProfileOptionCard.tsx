import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

interface Props {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  hasSwitch?: boolean;
  onPress?: () => void;
}

export default function ProfileOptionCard({
  icon,
  title,
  subtitle,
  hasSwitch,
  onPress,
}: Props) {

const [isEnabled, setIsEnabled] = useState(true);


  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>

      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Feather
            name={icon}
            size={22}
            color="#8A2BE2"
          />
        </View>

        <View>
          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      {hasSwitch ? (
  <Switch
  value={isEnabled}
  onValueChange={() => setIsEnabled(!isEnabled)}
  trackColor={{
    false: '#DDD',
    true: '#E61E78',
  }}
  thumbColor="#FFFFFF"
/>
) : (
  <Feather
    name="chevron-right"
    size={22}
    color="#999"
  />
)}

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3E8FF',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },

  subtitle: {
    color: '#777',
    fontSize: 13,
  },
});