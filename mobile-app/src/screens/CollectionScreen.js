import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../store/authStore';
import { useSyncStore } from '../store/syncStore';
import { api } from '../services/api';

// Approved species with their valid collection zones
const SPECIES_DATA = {
  'Ashwagandha': {
    scientificName: 'Withania somnifera',
    zones: ['Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Maharashtra'],
  },
  'Tulsi': {
    scientificName: 'Ocimum sanctum',
    zones: ['Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Karnataka'],
  },
  'Brahmi': {
    scientificName: 'Bacopa monnieri',
    zones: ['Kerala', 'Tamil Nadu', 'West Bengal', 'Assam'],
  },
  'Guduchi': {
    scientificName: 'Tinospora cordifolia',
    zones: ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh'],
  },
  'Shatavari': {
    scientificName: 'Asparagus racemosus',
    zones: ['Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Himachal Pradesh'],
  },
};

export default function CollectionScreen({ navigation }) {
  const collector = useAuthStore(state => state.collector);
  const addPendingCollection = useSyncStore(state => state.addPendingCollection);

  const [species, setSpecies] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected && networkState.isInternetReachable);
    };
    checkNetwork();
  }, []);

  // Get current location
  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for collection recording');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        timestamp: new Date().toISOString(),
      });

      Alert.alert('📍 Location Captured', 
        `Lat: ${loc.coords.latitude.toFixed(6)}\nLon: ${loc.coords.longitude.toFixed(6)}\nAccuracy: ${loc.coords.accuracy.toFixed(0)}m`
      );
    } catch (error) {
      Alert.alert('Location Error', 'Could not get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Submit collection
  const handleSubmit = async () => {
    // Validation
    if (!species) {
      Alert.alert('Error', 'Please select a species');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Please capture your GPS location');
      return;
    }
    if (!quantity) {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }

    const collectionData = {
      id: `COL-${Date.now()}`,
      product_id: `${species.toUpperCase().slice(0, 4)}-${Date.now()}`,
      species: species,
      scientific_name: SPECIES_DATA[species]?.scientificName,
      gps: location,
      collector_id: collector?.id || 'UNKNOWN',
      quantity: parseFloat(quantity),
      unit: 'kg',
      notes: notes,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    setSubmitting(true);

    if (isOnline) {
      // Try to submit directly to blockchain
      try {
        const response = await api.submitCollection(collectionData);
        if (response.success && response.geo_validated) {
          Alert.alert(
            '✅ Collection Recorded',
            'Your collection has been validated and recorded on the blockchain!',
            [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
          );
        } else if (!response.geo_validated) {
          Alert.alert(
            '❌ GPS Validation Failed',
            'The location is outside approved collection zones for this species. Collection rejected by blockchain.',
          );
        }
      } catch (error) {
        // If API fails, save locally
        addPendingCollection(collectionData);
        Alert.alert(
          '⏳ Saved Locally',
          'Could not reach server. Collection saved and will sync when online.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }
    } else {
      // Offline - save locally
      addPendingCollection(collectionData);
      Alert.alert(
        '⏳ Saved Offline',
        'Collection saved locally. It will be validated and synced when you\'re online.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }

    setSubmitting(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            📴 Offline Mode - Collection will be validated when synced
          </Text>
        </View>
      )}

      {/* Species Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Species *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={species}
            onValueChange={setSpecies}
            style={styles.picker}
          >
            <Picker.Item label="Select species..." value="" />
            {Object.keys(SPECIES_DATA).map(s => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
        {species && (
          <Text style={styles.hint}>
            Scientific: {SPECIES_DATA[species].scientificName}
            {'\n'}Valid zones: {SPECIES_DATA[species].zones.join(', ')}
          </Text>
        )}
      </View>

      {/* GPS Location */}
      <View style={styles.section}>
        <Text style={styles.label}>GPS Location *</Text>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={getLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.locationButtonIcon}>📍</Text>
              <Text style={styles.locationButtonText}>
                {location ? 'Update Location' : 'Capture GPS Location'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {location && (
          <View style={styles.locationDisplay}>
            <Text style={styles.locationText}>
              ✅ Location captured
            </Text>
            <Text style={styles.locationCoords}>
              Lat: {location.lat.toFixed(6)}
            </Text>
            <Text style={styles.locationCoords}>
              Lon: {location.lon.toFixed(6)}
            </Text>
            <Text style={styles.locationCoords}>
              Accuracy: {location.accuracy?.toFixed(0) || 'N/A'}m
            </Text>
          </View>
        )}
      </View>

      {/* Quantity */}
      <View style={styles.section}>
        <Text style={styles.label}>Quantity (kg) *</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter weight in kg"
          keyboardType="decimal-pad"
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isOnline ? '🔗 Submit to Blockchain' : '💾 Save Offline'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🛡️ GPS Validation</Text>
        <Text style={styles.infoText}>
          Your GPS coordinates will be validated by the blockchain smart contract using the Haversine formula. 
          If you're outside approved collection zones for the selected species, the collection will be rejected.
        </Text>
      </View>
    </ScrollView>
  );
}

// Need to import TextInput
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    alignItems: 'center',
  },
  offlineText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 18,
  },
  locationButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  locationButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationDisplay: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  locationCoords: {
    fontSize: 14,
    color: '#047857',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 18,
  },
});
