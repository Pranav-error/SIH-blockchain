import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { db } from '../database/db';
import { api } from '../services/api';

export const useSyncStore = create(
  persist(
    (set, get) => ({
      // State
      pendingCollections: [],
      syncedToday: 0,
      lastSyncTime: null,
      isSyncing: false,

      // Add a new pending collection
      addPendingCollection: async (collection) => {
        // Save to local SQLite database
        await db.saveCollection(collection);
        
        // Update store
        set(state => ({
          pendingCollections: [...state.pendingCollections, collection],
        }));
      },

      // Remove a synced/deleted collection
      removePendingCollection: async (id) => {
        // Remove from SQLite
        await db.deleteCollection(id);
        
        // Update store
        set(state => ({
          pendingCollections: state.pendingCollections.filter(c => c.id !== id),
        }));
      },

      // Update collection status
      updateCollectionStatus: async (id, status) => {
        // Update in SQLite
        await db.updateCollectionStatus(id, status);
        
        // Update store
        set(state => ({
          pendingCollections: state.pendingCollections.map(c => 
            c.id === id ? { ...c, status } : c
          ),
        }));
      },

      // Sync all pending collections
      syncAll: async () => {
        const { pendingCollections } = get();
        if (pendingCollections.length === 0) return { synced: 0, failed: 0 };

        set({ isSyncing: true });
        
        let synced = 0;
        let failed = 0;
        let rejected = 0;

        for (const collection of pendingCollections) {
          if (collection.status === 'rejected') continue; // Skip already rejected

          try {
            const response = await api.submitCollection(collection);
            
            if (response.success && response.geo_validated) {
              // Mark as synced in DB
              await db.markSynced(collection.id, response.txId);
              // Remove from pending
              set(state => ({
                pendingCollections: state.pendingCollections.filter(c => c.id !== collection.id),
                syncedToday: state.syncedToday + 1,
              }));
              synced++;
            } else if (!response.geo_validated) {
              // Mark as rejected
              await db.updateCollectionStatus(collection.id, 'rejected');
              set(state => ({
                pendingCollections: state.pendingCollections.map(c =>
                  c.id === collection.id ? { ...c, status: 'rejected' } : c
                ),
              }));
              rejected++;
            }
          } catch (error) {
            console.error('Sync error for', collection.id, error);
            failed++;
          }
        }

        set({ 
          isSyncing: false,
          lastSyncTime: new Date().toISOString(),
        });

        return { synced, failed, rejected };
      },

      // Clear all pending
      clearAll: () => {
        set({
          pendingCollections: [],
          syncedToday: 0,
        });
      },

      // Load pending from database (on app start)
      loadFromDatabase: async () => {
        const pending = await db.getPendingCollections();
        set({ pendingCollections: pending });
      },

      // Reset daily counter
      resetDailyCounter: () => {
        set({ syncedToday: 0 });
      },
    }),
    {
      name: 'herblock-sync',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        pendingCollections: state.pendingCollections,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);
