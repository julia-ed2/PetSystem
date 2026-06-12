import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { api } from '../service/api';
import Loading from '../components/Loading';

import LoginScreen         from '../screens/LoginScreen';
import TabNavigator        from './TabNavigator';
import DadosPessoaisScreen from '../screens/DadosPessoaisScreen';
import MeusPetsScreen      from '../screens/MeusPetsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);

  useEffect(() => {
    api.isLoggedIn().then(loggedIn => {
      setIsLoggedIn(loggedIn);
      setAuthChecked(true);
    });
  }, []);

  if (!authChecked) return <Loading />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 220,
      }}
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
    >
      <Stack.Screen name="Login"         component={LoginScreen} />
      <Stack.Screen name="MainTabs"      component={TabNavigator} />
      <Stack.Screen name="DadosPessoais" component={DadosPessoaisScreen} />
      <Stack.Screen name="MeusPets"      component={MeusPetsScreen} />
    </Stack.Navigator>
  );
}
