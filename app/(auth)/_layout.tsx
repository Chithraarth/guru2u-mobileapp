import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export const unstable_settings = {
  initialRouteName: 'sign-in',
};

export default function AuthLayout() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
