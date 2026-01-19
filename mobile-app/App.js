import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import PendingSyncScreen from './src/screens/PendingSyncScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Store
import { useAuthStore } from './src/store/authStore';
import { useSyncStore } from './src/store/syncStore';

// Database
import { initDatabase } from './src/database/db';

// Icons (using text for now, replace with expo-vector-icons)
const TabIcon = ({ name, focused }) => (
  <Text style={{ fontSize: 20 }}>{name}</Text>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator (after login)
function MainTabs() {
  const pendingCount = useSyncStore(state => state.pendingCollections.length);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: { backgroundColor: '#10B981' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
          title: 'HerBlock',
        }}
      />
      <Tab.Screen 
        name="Collect" 
        component={CollectionScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📍" focused={focused} />,
          title: 'New Collection',
        }}
      />
      <Tab.Screen 
        name="Pending" 
        component={PendingSyncScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="⏳" focused={focused} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          title: 'Pending Sync',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📋" focused={focused} />,
          title: 'History',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="⚙️" focused={focused} />,
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  // Initialize database on app start
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        console.log('Database initialized');
      } catch (error) {
        console.error('Database init failed:', error);
        Alert.alert('Error', 'Failed to initialize local storage');
      }
    };
    init();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
