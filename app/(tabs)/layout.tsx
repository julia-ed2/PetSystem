import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />

      <Tabs.Screen
        name="exams"
        options={{
          title: 'Exames',
        }}
      />

      <Tabs.Screen
        name="vaccines"
        options={{
          title: 'Vacinas',
        }}
      />

    </Tabs>
  );
}