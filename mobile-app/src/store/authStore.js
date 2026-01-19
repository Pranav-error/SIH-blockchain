import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      collector: null,
      isLoggedIn: false,

      // Actions
      login: (token, collector) => {
        set({
          token,
          collector,
          isLoggedIn: true,
        });
      },

      logout: () => {
        set({
          token: null,
          collector: null,
          isLoggedIn: false,
        });
      },

      updateCollector: (updates) => {
        set(state => ({
          collector: { ...state.collector, ...updates },
        }));
      },
    }),
    {
      name: 'herblock-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
