import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = 'onboarding-seen';

interface OnboardingContextValue {
  isLoaded: boolean;
  hasSeen: boolean;
  markSeen: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  isLoaded: false,
  hasSeen: false,
  markSeen: () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_STORAGE_KEY)
      .then((value) => setHasSeen(value === '1'))
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const markSeen = useCallback(() => {
    setHasSeen(true);
    AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, '1').catch(() => {});
  }, []);

  return (
    <OnboardingContext.Provider value={{ isLoaded, hasSeen, markSeen }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  return useContext(OnboardingContext);
}
