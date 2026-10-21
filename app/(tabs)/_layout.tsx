import React, { useEffect, useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { NebulaTabBar } from '@/components/NebulaTabBar';
import { useAuth } from '@/lib/authContext';
import { hasSkippedSetup, isProfileComplete, useMyProfile } from '@/lib/profile';
import { useColors } from '@/hooks/useColors';

export default function TabLayout() {
  const c = useColors();
  const { user } = useAuth();
  const { data: profile, isSuccess } = useMyProfile();
  const [skipped, setSkipped] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    hasSkippedSetup(user.uid).then((v) => alive && setSkipped(v));
    return () => {
      alive = false;
    };
  }, [user]);

  // First visit after sign-in: ask for the user's own details once, unless
  // they've already saved them or chosen "Skip for now".
  if (isSuccess && skipped === false && !isProfileComplete(profile)) {
    return <Redirect href={"/my-details?setup=1" as never} />;
  }

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
