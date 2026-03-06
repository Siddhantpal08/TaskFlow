import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider, useData } from './src/context/DataContext';
import { DARK } from './src/data/themes';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

import DashboardScreen from './src/screens/DashboardScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TeamScreen from './src/screens/TeamScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: DARK.bg,
    card: DARK.nav,
    text: DARK.t1,
    border: DARK.border,
    primary: DARK.accent,
  },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
  );
}

function NotifTabIcon({ focused }) {
  const { unreadCount } = useData();
  return (
    <View>
      <TabIcon emoji="🔔" focused={focused} />
      {unreadCount > 0 && (
        <View style={{
          position: 'absolute', top: -2, right: -4,
          backgroundColor: DARK.red, borderRadius: 6,
          width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
          borderWidth: 1.5, borderColor: DARK.nav,
        }}>
          <Text style={{ color: '#fff', fontSize: 7, fontWeight: '900' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerStyle: {
        backgroundColor: DARK.nav,
        shadowColor: 'transparent',
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: DARK.border,
      },
      headerTintColor: DARK.t1,
      headerTitleStyle: { fontWeight: '800', fontSize: 18 },
      tabBarStyle: {
        backgroundColor: DARK.nav,
        borderTopColor: DARK.border,
        height: 64,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarActiveTintColor: DARK.accent,
      tabBarInactiveTintColor: DARK.t3,
      tabBarShowLabel: true,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
    }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="✅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ focused }) => <NotifTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: DARK.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={DARK.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <DataProvider>
          <MainTabs />
        </DataProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
