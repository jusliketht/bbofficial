// =====================================================
// BURNBACK MOBILE APP - MAIN ENTRY POINT
// React Native app for Android and iOS
// =====================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import FilingScreen from './src/screens/filing/FilingScreen';
import DocumentsScreen from './src/screens/documents/DocumentsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import NotificationScreen from './src/screens/notifications/NotificationScreen';

// Import services
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Import theme
import { theme } from './src/theme/theme';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// =====================================================
// AUTHENTICATION STACK
// =====================================================
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// =====================================================
// MAIN APP STACK
// =====================================================
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen 
      name="Filing" 
      component={FilingScreen}
      options={{
        headerShown: true,
        title: 'ITR Filing',
        headerBackTitle: 'Back'
      }}
    />
    <Stack.Screen 
      name="Documents" 
      component={DocumentsScreen}
      options={{
        headerShown: true,
        title: 'Documents',
        headerBackTitle: 'Back'
      }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationScreen}
      options={{
        headerShown: true,
        title: 'Notifications',
        headerBackTitle: 'Back'
      }}
    />
  </Stack.Navigator>
);

// =====================================================
// MAIN TAB NAVIGATOR
// =====================================================
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Dashboard':
            iconName = 'dashboard';
            break;
          case 'Filing':
            iconName = 'description';
            break;
          case 'Documents':
            iconName = 'folder';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          case 'Settings':
            iconName = 'settings';
            break;
          default:
            iconName = 'help';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outline,
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarLabel: 'Home'
      }}
    />
    <Tab.Screen 
      name="Filing" 
      component={FilingScreen}
      options={{
        title: 'Filing',
        tabBarLabel: 'File ITR'
      }}
    />
    <Tab.Screen 
      name="Documents" 
      component={DocumentsScreen}
      options={{
        title: 'Documents',
        tabBarLabel: 'Docs'
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile'
      }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{
        title: 'Settings',
        tabBarLabel: 'Settings'
      }}
    />
  </Tab.Navigator>
);

// =====================================================
// MAIN APP COMPONENT
// =====================================================
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <PaperProvider theme={theme}>
              <AuthProvider>
                <NotificationProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </NotificationProvider>
              </AuthProvider>
            </PaperProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// =====================================================
// APP NAVIGATOR (Conditional Routing)
// =====================================================
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

// =====================================================
// LOADING SCREEN
// =====================================================
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onBackground,
  },
});

export default App;
