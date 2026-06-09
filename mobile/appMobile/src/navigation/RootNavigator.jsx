import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen  from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';

// Telas auxiliares — adicione as implementações conforme o projeto crescer
import DadosPessoaisScreen from '../screens/DadosPessoaisScreen';
import MeusPetsScreen      from '../screens/MeusPetsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth */}
      <Stack.Screen name="Login"     component={LoginScreen} />

      {/* App principal com Tab Bar */}
      <Stack.Screen name="MainTabs"  component={TabNavigator} />

      {/* Telas acessadas via Perfil */}
      <Stack.Screen name="DadosPessoais" component={DadosPessoaisScreen} />
      <Stack.Screen name="MeusPets"      component={MeusPetsScreen} />
    </Stack.Navigator>
  );
}