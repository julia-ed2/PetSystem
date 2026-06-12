import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import HomeScreen     from '../screens/HomeScreen';
import ExamesScreen   from '../screens/ExamesScreen';
import VacinasScreen  from '../screens/VacinasScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import PerfilScreen   from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, label }) {
  if (focused) {
    return (
      <View style={styles.activeIconWrap}>
        <Ionicons name={name} size={20} color={COLORS.white} />
        <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '700', marginTop: 2, padding: 2 }}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <Ionicons name={name} size={22} color={COLORS.purple} />
      <Text style={styles.tabLabel}>{label}</Text>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor:   COLORS.white,
        tabBarInactiveTintColor: COLORS.purple,
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Início" />,
          tabBarBackground: () => null,
        }}
      />
      <Tab.Screen
        name="Exames"
        component={ExamesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'document-text' : 'document-text-outline'} focused={focused} label="Exames" />,
        }}
      />
      <Tab.Screen
        name="Vacinas"
        component={VacinasScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'medical' : 'medical-outline'} focused={focused} label="Vacinas" />,
        }}
      />
      <Tab.Screen
        name="Histórico"
        component={HistoricoScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'time' : 'time-outline'} focused={focused} label="Histórico" />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} label="Perfil" />,
          tabBarItemStyle: focused => focused ? styles.activeTab : null,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIconWrap: {
    backgroundColor: COLORS.purple,
    minWidth: 52,
    minHeight: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});