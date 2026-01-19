import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useSyncStore } from '../store/syncStore';

export default function HomeScreen({ navigation }) {
  const collector = useAuthStore(state => state.collector);
  const pendingCollections = useSyncStore(state => state.pendingCollections);
  const syncedToday = useSyncStore(state => state.syncedToday);
  
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected && networkState.isInternetReachable);
    };
    checkNetwork();
    const interval = setInterval(checkNetwork, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Trigger sync if online
    if (isOnline && pendingCollections.length > 0) {
      await useSyncStore.getState().syncAll();
    }
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Status Bar */}
      <View style={[styles.statusBar, isOnline ? styles.online : styles.offline]}>
        <Text style={styles.statusText}>
          {isOnline ? '🟢 Online' : '🔴 Offline - Data will sync later'}
        </Text>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.collectorName}>{collector?.name || 'Collector'}</Text>
        <Text style={styles.collectorId}>ID: {collector?.id || 'COL-XXX'}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingCollections.length}</Text>
          <Text style={styles.statLabel}>Pending Sync</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{syncedToday}</Text>
          <Text style={styles.statLabel}>Synced Today</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Collect')}
      >
        <Text style={styles.actionIcon}>📍</Text>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>New Collection</Text>
          <Text style={styles.actionSubtitle}>Record herb collection with GPS</Text>
        </View>
        <Text style={styles.actionArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Pending')}
      >
        <Text style={styles.actionIcon}>⏳</Text>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>Sync Pending</Text>
          <Text style={styles.actionSubtitle}>
            {pendingCollections.length} items waiting to sync
          </Text>
        </View>
        <Text style={styles.actionArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.actionIcon}>📋</Text>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>View History</Text>
          <Text style={styles.actionSubtitle}>See past collections</Text>
        </View>
        <Text style={styles.actionArrow}>→</Text>
      </TouchableOpacity>

      {/* Blockchain Badge */}
      <View style={styles.blockchainBadge}>
        <Text style={styles.badgeIcon}>🔗</Text>
        <Text style={styles.badgeText}>
          All collections are recorded on Hyperledger Fabric blockchain with GPS validation
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusBar: {
    padding: 10,
    alignItems: 'center',
  },
  online: {
    backgroundColor: '#D1FAE5',
  },
  offline: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeCard: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  welcomeText: {
    color: '#D1FAE5',
    fontSize: 16,
  },
  collectorName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  collectorId: {
    color: '#D1FAE5',
    fontSize: 14,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  badgeText: {
    flex: 1,
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 18,
  },
});
