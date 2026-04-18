import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../database/db';
import { api } from '../services/api';

export default function HistoryScreen() {
  const [collections, setCollections] = useState([]);
  const [filter, setFilter] = useState('all'); // all, synced, pending, hardware
  const [loading, setLoading] = useState(false);

  // Reload every time this tab is focused (catches new submissions)
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [filter])
  );

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (filter === 'hardware') {
        // Fetch ESP32 hardware events from backend
        const events = await api.getIntakeEvents(50);
        const mapped = events.map(e => ({
          id: e.id,
          product_id: e.product_id,
          species: e.species_name || 'Unknown',
          gps: { lat: e.latitude || 0, lon: e.longitude || 0 },
          quantity: e.quantity_kg ? e.quantity_kg.toFixed(3) : (e.weight_grams ? (e.weight_grams / 1000).toFixed(3) : null),
          timestamp: e.timestamp,
          status: 'accepted',
          synced: true,
          txId: e.blockchain_tx_id || e.blockchain_hash?.slice(0, 16),
          source: 'hardware',
        }));
        setCollections(mapped);
      } else {
        // Local SQLite records
        const localHistory = await db.getCollectionHistory(filter);

        // Also try to fetch hardware events and merge for 'all' view
        if (filter === 'all') {
          try {
            const events = await api.getIntakeEvents(20);
            const hwMapped = events.map(e => ({
              id: e.id,
              product_id: e.product_id,
              species: e.species_name || 'Unknown',
              gps: { lat: e.latitude || 0, lon: e.longitude || 0 },
              quantity: e.quantity_kg ? e.quantity_kg.toFixed(3) : (e.weight_grams ? (e.weight_grams / 1000).toFixed(3) : null),
              timestamp: e.timestamp,
              status: 'accepted',
              synced: true,
              txId: e.blockchain_tx_id || e.blockchain_hash?.slice(0, 16),
              source: 'hardware',
            }));
            // Deduplicate: skip hw events already in local DB by product_id
            const localIds = new Set(localHistory.map(c => c.product_id));
            const newHw = hwMapped.filter(h => !localIds.has(h.product_id));
            const merged = [...localHistory, ...newHw].sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
            setCollections(merged);
          } catch {
            setCollections(localHistory);
          }
        } else {
          setCollections(localHistory);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.card,
      item.synced && styles.cardSynced,
      item.status === 'rejected' && styles.cardRejected,
    ]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.species}>{item.species}</Text>
          {item.source === 'hardware' && (
            <Text style={styles.hwBadge}>📡 ESP32 Hardware</Text>
          )}
        </View>
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
        {item.gps?.lat ? (
          <Text style={styles.detailRow}>📍 {item.gps.lat.toFixed(4)}, {item.gps.lon.toFixed(4)}</Text>
        ) : null}
        {item.quantity ? <Text style={styles.detailRow}>⚖️ {item.quantity} kg</Text> : null}
        {item.product_id ? <Text style={styles.detailRow}>🏷️ {item.product_id}</Text> : null}
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
        {[
          { key: 'all', label: 'All' },
          { key: 'synced', label: 'Synced' },
          { key: 'pending', label: 'Pending' },
          { key: 'hardware', label: '📡 HW' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterTab, filter === key && styles.filterTabActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[
              styles.filterText,
              filter === key && styles.filterTextActive
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : collections.length === 0 ? (
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
  hwBadge: {
    fontSize: 11,
    color: '#6366F1',
    marginTop: 2,
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
