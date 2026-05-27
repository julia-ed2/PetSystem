import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

type PetTagProps = {
  name: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function PetTag({
  name,
  selected = false,
  onPress,
}: PetTagProps) {
  return (

    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
    >

      <Text
        style={[
          styles.text,
          selected && styles.selectedText,
        ]}
      >
        {name}
      </Text>

    </TouchableOpacity>

  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: 'rgba(255,255,255,0.25)',

    paddingVertical: 12,
    paddingHorizontal: 22,

    borderRadius: 18,

    marginRight: 12,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedContainer: {
    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 4,
  },

  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  selectedText: {
    color: '#E61E78',
    fontWeight: '700',
  },

});