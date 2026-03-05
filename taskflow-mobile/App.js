import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { DARK } from './src/data/themes';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

import DashboardScreen from './src/screens/DashboardScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TeamScreen from './src/screens/TeamScreen';

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
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerStyle: { backgroundColor: DARK.nav, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: DARK.border },
      headerTintColor: DARK.t1,
      headerTitleStyle: { fontWeight: '800', fontSize: 18 },
      tabBarStyle: { backgroundColor: DARK.nav, borderTopColor: DARK.border, height: 60, paddingBottom: 10, paddingTop: 10 },
      tabBarActiveTintColor: DARK.accent,
      tabBarInactiveTintColor: DARK.t3,
    }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Team" component={TeamScreen} />
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
