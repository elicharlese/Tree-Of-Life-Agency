import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import NetInfo from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Redux store
import { store, persistor } from './src/store';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import CustomersScreen from './src/screens/crm/CustomersScreen';
import LeadsScreen from './src/screens/crm/LeadsScreen';
import ProjectsScreen from './src/screens/crm/ProjectsScreen';
import MessagesScreen from './src/screens/communication/MessagesScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import CustomerDetailsScreen from './src/screens/crm/CustomerDetailsScreen';
import LeadDetailsScreen from './src/screens/crm/LeadDetailsScreen';

// Components
import LoadingScreen from './src/components/common/LoadingScreen';
import OfflineIndicator from './src/components/common/OfflineIndicator';

// Services
import { AuthService } from './src/services/AuthService';
import { NotificationService } from './src/services/NotificationService';
import { SyncService } from './src/services/SyncService';

// Types
import { RootStackParamList, TabParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Tab Navigator for authenticated users
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Customers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Leads':
              iconName = focused ? 'flame' : 'flame-outline';
              break;
            case 'Projects':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for updates
      if (!__DEV__) {
        await checkForUpdates();
      }

      // Initialize services
      await Promise.all([
        AuthService.initialize(),
        NotificationService.initialize(),
        SyncService.initialize(),
      ]);

      // Check authentication status
      const authStatus = await AuthService.checkAuthStatus();
      setIsAuthenticated(authStatus);

      // Set up network monitoring
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected ?? true);
        
        if (state.isConnected) {
          // Trigger sync when connection is restored
          SyncService.triggerFullSync();
        }
      });

      // Register notification handlers
      const notificationSubscription = Notifications.addNotificationReceivedListener(
        handleNotificationReceived
      );

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

      // Cleanup function
      return () => {
        unsubscribe();
        notificationSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to update now?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Update',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  console.error('Update error:', error);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Update check error:', error);
    }
  };

  const handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('Notification received:', notification);
    
    // Handle different notification types
    const { type, data } = notification.request.content.data || {};
    
    switch (type) {
      case 'new_message':
        // Update message badge count
        break;
      case 'lead_updated':
        // Trigger lead sync
        SyncService.syncLeads();
        break;
      case 'customer_updated':
        // Trigger customer sync
        SyncService.syncCustomers();
        break;
      default:
        break;
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('Notification response:', response);
    
    // Navigate based on notification data
    const { type, entityId } = response.notification.request.content.data || {};
    
    // Navigation logic would be handled by a navigation ref
    // This is a simplified example
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <NavigationContainer>
            <StatusBar style="auto" />
            
            {!isConnected && <OfflineIndicator />}
            
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                // Authenticated stack
                <>
                  <Stack.Screen name="MainTabs" component={TabNavigator} />
                  <Stack.Screen 
                    name="CustomerDetails" 
                    component={CustomerDetailsScreen}
                    options={{ headerShown: true, title: 'Customer Details' }}
                  />
                  <Stack.Screen 
                    name="LeadDetails" 
                    component={LeadDetailsScreen}
                    options={{ headerShown: true, title: 'Lead Details' }}
                  />
                  <Stack.Screen 
                    name="Profile" 
                    component={ProfileScreen}
                    options={{ headerShown: true, title: 'Profile' }}
                  />
                </>
              ) : (
                // Unauthenticated stack
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen}
                  options={{ animationTypeForReplace: 'pop' }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </PersistGate>
      </ReduxProvider>
    </SafeAreaProvider>
  );
};

export default App;
