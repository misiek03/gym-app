import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#0e0e0e', 
        borderTopWidth: 0,
        paddingBottom: 8, 
        paddingTop: 8,
        height: 65,
        elevation: 0,
        shadowOpacity: 0
      },
      tabBarActiveTintColor: '#cafd00',
      tabBarInactiveTintColor: '#adaaaa',
      tabBarShowLabel: false
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="database" 
        options={{ 
          title: 'Database',
          tabBarIcon: ({ color }) => <Ionicons name="server" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="fitness_center" 
        options={{ 
          title: 'Workout',
          tabBarIcon: ({ color }) => <Ionicons name="barbell" size={28} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="notepad" 
        options={{ 
          title: 'Notepad',
          tabBarIcon: ({ color }) => <Ionicons name="create" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
