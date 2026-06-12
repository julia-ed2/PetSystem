import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

import HomeScreen      from '../screens/HomeScreen';
import ExamesScreen    from '../screens/ExamesScreen';
import VacinasScreen   from '../screens/VacinasScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import PerfilScreen    from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, label }) {
  if (focused) {
    return (
      <View style={activeWrap}>
        <Ionicons name={name} size={18} color={COLORS.white} />
        <Text style={activeLabel}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={inactiveWrap}>
      <Ionicons name={name} size={22} color={COLORS.purple} />
      <Text style={inactiveLabel}>{label}</Text>
    </View>
  );
}

const activeWrap = {
  backgroundColor: COLORS.purple,
  minWidth: 64,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 5,
  paddingHorizontal: 12,
};
const activeLabel   = { color: COLORS.white, fontSize: 12, fontWeight: '700' };
const inactiveWrap  = { alignItems: 'center', justifyContent: 'center', gap: 2 };
const inactiveLabel = { fontSize: 10, fontWeight: '600', color: COLORS.purple };

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 4);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          height: 58 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.10,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -2 },
          elevation: 14,
        },
        tabBarActiveTintColor:   COLORS.white,
        tabBarInactiveTintColor: COLORS.purple,
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Início" />,
        }}
      />
      <Tab.Screen
        name="Exames"
        component={ExamesScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon name={focused ? 'document-text' : 'document-text-outline'} focused={focused} label="Exames" />,
        }}
      />
      <Tab.Screen
        name="Vacinas"
        component={VacinasScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon name={focused ? 'medical' : 'medical-outline'} focused={focused} label="Vacinas" />,
        }}
      />
      <Tab.Screen
        name="Histórico"
        component={HistoricoScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon name={focused ? 'time' : 'time-outline'} focused={focused} label="Histórico" />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} label="Perfil" />,
        }}
      />
    </Tab.Navigator>
  );
}
