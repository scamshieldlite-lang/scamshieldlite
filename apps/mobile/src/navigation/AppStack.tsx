import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import ScanResultScreen from "@/screens/scan/ScanResultScreen";
import type { ScanResponse } from "@scamshieldlite/shared/";
import PaywallScreen from "@/screens/subscription/PaywallScreen";

export type AppStackParamList = {
  MainTabs: undefined;
  ScanResult: {
    result: ScanResponse;
    originalText: string; // ← added — needed for report submission
  };
  Paywall: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{
          presentation: "card",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
