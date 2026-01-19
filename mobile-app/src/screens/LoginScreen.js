import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const [collectorId, setCollectorId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!collectorId.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please enter Collector ID and PIN');
      return;
    }

    setLoading(true);
    try {
      // Try online login first
      const response = await api.login(collectorId, pin);
      login(response.token, response.collector);
    } catch (error) {
      // If offline, try local auth
      if (error.message === 'Network Error') {
        // Check local credentials (stored from previous login)
        const localAuth = await checkLocalCredentials(collectorId, pin);
        if (localAuth) {
          login(null, localAuth.collector); // Login without token (offline mode)
          Alert.alert('Offline Mode', 'You are working offline. Data will sync when connected.');
        } else {
          Alert.alert('Error', 'Cannot verify credentials offline. Please connect to internet.');
        }
      } else {
        Alert.alert('Login Failed', error.response?.data?.detail || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🌿</Text>
        <Text style={styles.logoText}>HerBlock</Text>
        <Text style={styles.tagline}>Collector App</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Collector ID</Text>
        <TextInput
          style={styles.input}
          value={collectorId}
          onChangeText={setCollectorId}
          placeholder="Enter your Collector ID"
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <Text style={styles.label}>PIN</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder="Enter your PIN"
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Contact your supervisor if you forgot your credentials
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 Blockchain-Verified Traceability
        </Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// Local credential check for offline mode
async function checkLocalCredentials(collectorId, pin) {
  // This would check SQLite for stored credentials
  // Implementation in database module
  return null; // Placeholder
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#10B981',
    fontSize: 14,
  },
  versionText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 5,
  },
});
