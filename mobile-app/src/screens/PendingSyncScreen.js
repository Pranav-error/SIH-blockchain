import * as Network from 'expo-network';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { api } from '../services/api';
import { useSyncStore } from '../store/syncStore';

export default function PendingSyncScreen() {
  const pendingCollections = useSyncStore(state => state.pendingCollections);
  const removePendingCollection = useSyncStore(state => state.removePendingCollection);
  const updateCollectionStatus = useSyncStore(state => state.updateCollectionStatus);
  
  const [syncing, setSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  // Sync single collection
  const syncOne = async (collection) => {
    setSyncingId(collection.id);
    
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        Alert.alert('Offline', 'Please connect to internet to sync');
        return;
      }

      const response = await api.submitCollection(collection);
      
      if (response.success && response.geo_validated) {
        removePendingCollection(collection.id);
        Alert.alert('✅ Synced', 'Collection validated and recorded on blockchain!');
      } else if (!response.geo_validated) {
        updateCollectionStatus(collection.id, 'rejected');
        Alert.alert(
          '❌ Rejected',
          'GPS validation failed. Location is outside approved zones.',
          [
            { text: 'Keep', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removePendingCollection(collection.id) }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Sync Failed', 'Could not reach server. Try again later.');
    } finally {
      setSyncingId(null);
    }
  };

  // Sync all pending
  const syncAll = async () => {
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected) {
      Alert.alert('Offline', 'Please connect to internet to sync');
      return;
    }

    setSyncing(true);
    let synced = 0;
    let failed = 0;
    let rejected = 0;

    for (const collection of pendingCollections) {
      try {
        const response = await api.submitCollection(collection);
        if (response.success && response.geo_validated) {
          removePendingCollection(collection.id);
          synced++;
        } else if (!response.geo_validated) {
          updateCollectionStatus(collection.id, 'rejected');
          rejected++;
        }
      } catch (error) {
        failed++;
      }
    }

    setSyncing(false);
    Alert.alert(
      'Sync Complete',
      `✅ Synced: ${synced}\n❌ Rejected: ${rejected}\n⚠️ Failed: ${failed}`
    );
  };

  // Delete single
  const deleteOne = (collection) => {
    Alert.alert(
      'Delete Collection?',
      'This will permanently delete this pending collection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => removePendingCollection(collection.id) 
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.card,
      item.status === 'rejected' && styles.cardRejected
    ]}>
      <View style={styles.cardHeader}>
        <Text style={styles.species}>{item.species}</Text>
        <Text style={[
          styles.status,
          item.status === 'rejected' ? styles.statusRejected : styles.statusPending
        ]}>
          {item.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
        </Text>
      </View>
      
      <Text style={styles.detail}>
        📍 {item.gps?.lat?.toFixed(4)}, {item.gps?.lon?.toFixed(4)}
      </Text>
      <Text style={styles.detail}>
        ⚖️ {item.quantity} kg
      </Text>
      <Text style={styles.detail}>
        🕐 {new Date(item.timestamp).toLocaleString()}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.syncButton]}
          onPress={() => syncOne(item)}
          disabled={syncingId === item.id}
        >
          {syncingId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>🔄 Sync</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteOne(item)}
        >
          <Text style={styles.actionButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (pendingCollections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyTitle}>All Synced!</Text>
        <Text style={styles.emptyText}>No pending collections to sync</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sync All Button */}
      <TouchableOpacity
        style={[styles.syncAllButton, syncing && styles.syncAllButtonDisabled]}
        onPress={syncAll}
        disabled={syncing}
      >
        {syncing ? (
          <>
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.syncAllButtonText}>Syncing...</Text>
          </>
        ) : (
          <Text style={styles.syncAllButtonText}>
            🔄 Sync All ({pendingCollections.length} items)
          </Text>
        )}
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={pendingCollections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  syncAllButton: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncAllButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  syncAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRejected: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  species: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  detail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
});
