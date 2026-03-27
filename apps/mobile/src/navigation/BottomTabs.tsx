// apps/mobile/src/navigation/BottomTabs.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Shield, History, User } from "lucide-react-native";
import { ScanInputScreen } from "@/screens/scan/ScanInputScreen";
import { HistoryScreen } from "@/screens/history/HistoryScreen";
import { AccountScreen } from "@/screens/account/AccountScreen";
import { Colors } from "@/constants/colors";

export type BottomTabParamList = {
  Scan: undefined;
  History: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface, // #0B1F3A
          borderTopColor: Colors.border, // Subtle border
          height: 65, // Extra height for Lagos/US mobile reach
          paddingBottom: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Scan"
        component={ScanInputScreen}
        options={{
          tabBarLabel: "Scan",
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => (
            <History color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
