import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  petName: string;
};

export default function StatusCard({ petName }: Props) {
  return (
    <View
      style={{
        backgroundColor: '#E61E78',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginTop: 8,
      }}
    >

      <View>
        <Text
          style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          Atendimento em andamento:
        </Text>

        <Text
          style={{
            color: '#fff',
            marginTop: 8,
            fontSize: 14,
          }}
        >
          {petName} está em observação
        </Text>
      </View>

      <Text
        style={{
          color: '#fff',
          fontSize: 8,
          alignSelf: 'flex-end',
          marginBottom: 8,
          fontWeight: 'bold',
        }}
      >
      </Text>

    </View>
  );
}