import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../database/db';
import { useAuthStore } from '../store/authStore';
import { useSyncStore } from '../store/syncStore';

export default function SettingsScreen() {
  const collector = useAuthStore(state => state.collector);
  const logout = useAuthStore(state => state.logout);
  const clearPending = useSyncStore(state => state.clearAll);
  const pendingCount = useSyncStore(state => state.pendingCollections.length);

  const handleLogout = () => {
    if (pendingCount > 0) {
      Alert.alert(
        'Pending Collections',
        `You have ${pendingCount} unsynced collections. Logging out will NOT delete them. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: logout }
        ]
      );
    } else {
      logout();
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will delete all local data including pending collections. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await db.clearAll();
            clearPending();
            Alert.alert('Done', 'All local data cleared');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collector Profile</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>{collector?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Collector ID</Text>
            <Text style={styles.profileValue}>{collector?.id || 'N/A'}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Region</Text>
            <Text style={styles.profileValue}>{collector?.region || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>Total Synced</Text>
          </View>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Blockchain</Text>
            <Text style={styles.infoValue}>Hyperledger Fabric 2.4</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Smart Contract</Text>
            <Text style={styles.infoValue}>herblock v1.1</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleClearData}
        >
          <Text style={styles.actionButtonText}>🗑️ Clear All Local Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            🚪 Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🌿 HerBlock Collector App</Text>
        <Text style={styles.footerSubtext}>
          Blockchain-Verified Herb Traceability
        </Text>
        <Text style={styles.footerSubtext}>
          Patent Pending Technology
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
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    color: '#991B1B',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
