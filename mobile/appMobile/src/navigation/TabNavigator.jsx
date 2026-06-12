import React, { useRef, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

import HomeScreen      from '../screens/HomeScreen';
import ExamesScreen    from '../screens/ExamesScreen';
import VacinasScreen   from '../screens/VacinasScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import PerfilScreen    from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

// Slide-in + fade ao entrar em foco — easing iOS para todas as abas
function withSlide(Screen) {
  const SlideScreen = (props) => {
    const progress   = useRef(new Animated.Value(0)).current;
    const opacity    = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

    useFocusEffect(
      useCallback(() => {
        progress.setValue(0);
        Animated.timing(progress, {
          toValue:         1,
          duration:        260,
          easing:          Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }).start();
      }, [progress]),
    );

    return (
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateX }] }}>
        <Screen {...props} />
      </Animated.View>
    );
  };
  SlideScreen.displayName = `Slide(${Screen.name})`;
  return SlideScreen;
}

const HomeF      = withSlide(HomeScreen);
const ExamesF    = withSlide(ExamesScreen);
const VacinasF   = withSlide(VacinasScreen);
const HistoricoF = withSlide(HistoricoScreen);
const PerfilF    = withSlide(PerfilScreen);

function TabIcon({ iconName, focused, label }) {
  return (
    <View style={[wrap, focused && wrapActive]}>
      <Ionicons
        name={focused ? iconName : `${iconName}-outline`}
        size={21}
        color={focused ? COLORS.pink : COLORS.gray400}
      />
      <Text style={[labelBase, focused && labelOn]}>{label}</Text>
    </View>
  );
}

const wrap = {
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 10,
  paddingTop: 5,
  paddingBottom: 4,
  borderRadius: 14,
  minWidth: 54,
  gap: 3,
};
const wrapActive  = { backgroundColor: COLORS.pink + '14' };
const labelBase   = { fontSize: 10, fontWeight: '600', color: COLORS.gray400 };
const labelOn     = { color: COLORS.pink };

export default function TabNavigator() {
  const insets    = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 6);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:     false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth:  1,
          borderTopColor:  COLORS.gray200,
          height:          60 + bottomPad,
          paddingBottom:   bottomPad,
          paddingTop:      4,
          shadowColor:     '#000',
          shadowOpacity:   0.07,
          shadowRadius:    10,
          shadowOffset:    { width: 0, height: -2 },
          elevation:       12,
        },
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeF}
        options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="home" focused={focused} label="Início" /> }}
      />
      <Tab.Screen
        name="Exames"
        component={ExamesF}
        options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="document-text" focused={focused} label="Exames" /> }}
      />
      <Tab.Screen
        name="Vacinas"
        component={VacinasF}
        options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="medical" focused={focused} label="Vacinas" /> }}
      />
      <Tab.Screen
        name="Histórico"
        component={HistoricoF}
        options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="time" focused={focused} label="Histórico" /> }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilF}
        options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="person" focused={focused} label="Perfil" /> }}
      />
    </Tab.Navigator>
  );
}
