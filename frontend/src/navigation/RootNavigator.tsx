import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import LeadsScreen from '../screens/LeadsScreen';
import EscalationsScreen from '../screens/EscalationsScreen';
import FollowUpsScreen from '../screens/FollowUpsScreen';
import ConversationDetailScreen from '../screens/ConversationDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stepper label mapping for tab icons
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  let icon = '🏠';
  if (label === 'Leads') icon = '📈';
  else if (label === 'Escalations') icon = '⚠️';
  else if (label === 'Follow-ups') icon = '⏰';

  return (
    <Text style={[styles.iconText, focused ? styles.iconFocused : styles.iconUnfocused]}>
      {icon}
    </Text>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.cardBg,
          borderTopColor: theme.colors.cardBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: theme.spacing.sm,
          paddingTop: theme.spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.xs,
          fontWeight: theme.typography.weights.semibold,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Escalations" component={EscalationsScreen} />
      <Tab.Screen name="Follow-ups" component={FollowUpsScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="ConversationDetail" 
        component={ConversationDetailScreen} 
        options={{
          animation: 'slide_from_right'
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconText: {
    fontSize: 20,
  },
  iconFocused: {
    opacity: 1,
  },
  iconUnfocused: {
    opacity: 0.5,
  }
});
export default RootNavigator;
