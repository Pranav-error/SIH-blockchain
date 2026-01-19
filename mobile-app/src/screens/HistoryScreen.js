import { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../database/db';

export default function HistoryScreen() {
  const [collections, setCollections] = useState([]);
  const [filter, setFilter] = useState('all'); // all, synced, pending

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      const history = await db.getCollectionHistory(filter);
      setCollections(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.card,
      item.synced && styles.cardSynced,
      item.status === 'rejected' && styles.cardRejected,
    ]}>
      <View style={styles.cardHeader}>
        <Text style={styles.species}>{item.species}</Text>
        <View style={[
          styles.statusBadge,
          item.synced ? styles.badgeSynced : 
          item.status === 'rejected' ? styles.badgeRejected : styles.badgePending
        ]}>
          <Text style={styles.statusText}>
            {item.synced ? '✅ Synced' : 
             item.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailRow}>📍 {item.gps?.lat?.toFixed(4)}, {item.gps?.lon?.toFixed(4)}</Text>
        <Text style={styles.detailRow}>⚖️ {item.quantity} kg</Text>
        <Text style={styles.detailRow}>🕐 {new Date(item.timestamp).toLocaleDateString()}</Text>
        {item.txId && (
          <Text style={styles.txId}>🔗 TX: {item.txId.slice(0, 16)}...</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'synced', 'pending'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              filter === f && styles.filterTextActive
            ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {collections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No collections yet</Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
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
    borderLeftWidth: 4,
    borderLeftColor: '#FCD34D',
  },
  cardSynced: {
    borderLeftColor: '#10B981',
  },
  cardRejected: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSynced: {
    backgroundColor: '#D1FAE5',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    gap: 4,
  },
  detailRow: {
    fontSize: 14,
    color: '#6B7280',
  },
  txId: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
