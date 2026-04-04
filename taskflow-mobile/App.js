import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
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
import NotesListScreen from './src/screens/NotesListScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const AppStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const NotifStack = createStackNavigator();

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
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Login" component={LoginScreen} />
      <AppStack.Screen name="Register" component={RegisterScreen} />
      <AppStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AppStack.Navigator>
  );
}

function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
}

// Notification bell shown in header of each screen
function NotifBell() {
  const { unreadCount } = useData();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('_Notifications')}
      style={{ marginRight: 16, position: 'relative' }}
    >
      <Text style={{ fontSize: 22 }}>🔔</Text>
      {unreadCount > 0 && (
        <View style={{
          position: 'absolute', top: -3, right: -4,
          backgroundColor: DARK.red, borderRadius: 7,
          minWidth: 14, height: 14, justifyContent: 'center', alignItems: 'center',
          borderWidth: 1.5, borderColor: DARK.nav, paddingHorizontal: 1,
        }}>
          <Text style={{ color: '#fff', fontSize: 7, fontWeight: '900' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function FriendsTabIcon({ focused }) {
  const { friendRequests } = useData();
  const count = friendRequests?.length || 0;
  return (
    <View>
      <TabIcon emoji="🤝" focused={focused} />
      {count > 0 && (
        <View style={{
          position: 'absolute', top: -2, right: -4,
          backgroundColor: DARK.purple || '#B083FF', borderRadius: 6,
          width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
          borderWidth: 1.5, borderColor: DARK.nav,
        }}>
          <Text style={{ color: '#fff', fontSize: 7, fontWeight: '900' }}>
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      )}
    </View>
  );
}

const sharedHeaderOptions = {
  headerStyle: {
    backgroundColor: DARK.nav,
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: DARK.border,
  },
  headerTintColor: DARK.t1,
  headerTitleStyle: { fontWeight: '800', fontSize: 18 },
  headerRight: () => <NotifBell />,
};

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      ...sharedHeaderOptions,
      tabBarStyle: {
        backgroundColor: DARK.nav,
        borderTopColor: DARK.border,
        height: 64,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarActiveTintColor: DARK.accent,
      tabBarInactiveTintColor: DARK.t3,
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
        name="Notes"
        component={NotesListScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📝" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ focused }) => <FriendsTabIcon focused={focused} />,
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

// Wrap tabs + notifications in an app stack so notif screen can be pushed
function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="_Main" component={MainTabs} />
      <AppStack.Screen
        name="_Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: 'Notifications',
          ...sharedHeaderOptions,
          headerRight: undefined,
        }}
      />
      <AppStack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ headerShown: false }}
      />
    </AppStack.Navigator>
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
          <AppNavigator />
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
