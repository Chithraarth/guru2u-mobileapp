import React from 'react';
import { Tabs } from 'expo-router';
import { NebulaTabBar } from '@/components/NebulaTabBar';
import { useColors } from '@/hooks/useColors';

export default function TabLayout() {
  const c = useColors();
  return (
    <Tabs
      tabBar={(props) => <NebulaTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
